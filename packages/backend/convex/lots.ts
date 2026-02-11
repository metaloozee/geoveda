import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAuthWithWallet } from "./lib/permissions";
import {
  canAccessLot,
  canCreateLot,
  getNextStepType,
  ROLE_STEP_PERMISSIONS,
} from "./lib/workflow";

const lotStatus = v.union(
  v.literal("created"),
  v.literal("in_progress"),
  v.literal("complete")
);

const lotValidator = v.object({
  _id: v.id("lots"),
  _creationTime: v.number(),
  lotNumber: v.string(),
  productName: v.string(),
  origin: v.string(),
  status: lotStatus,
  createdBy: v.id("users"),
  nextRequiredStep: v.optional(v.union(v.string(), v.null())),
  createdAt: v.number(),
  updatedAt: v.number(),
});

function generateLotNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LOT-${date}-${randomPart}`;
}

export const create = mutation({
  args: {
    productName: v.string(),
    origin: v.string(),
  },
  returns: v.object({
    lotId: v.id("lots"),
    lotNumber: v.string(),
  }),
  handler: async (ctx, args) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found. Please complete registration.",
      });
    }

    if (!canCreateLot(appUser.role)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only farmers and admins can create lots",
      });
    }

    const now = Date.now();
    const lotNumber = generateLotNumber();

    const lotId = await ctx.db.insert("lots", {
      lotNumber,
      productName: args.productName,
      origin: args.origin,
      status: "created",
      createdBy: appUser._id,
      nextRequiredStep: "harvest",
      createdAt: now,
      updatedAt: now,
    });

    return { lotId, lotNumber };
  },
});

export const list = query({
  args: {},
  returns: v.array(lotValidator),
  handler: async (ctx) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found",
      });
    }

    if (appUser.role === "admin") {
      return await ctx.db.query("lots").collect();
    }

    const createdByLots = await ctx.db
      .query("lots")
      .filter((q) => q.eq(q.field("createdBy"), appUser._id))
      .collect();

    const participantSteps = await ctx.db
      .query("steps")
      .withIndex("by_actorId", (q) => q.eq("actorId", appUser._id))
      .collect();
    const participantLotIds = new Set(
      participantSteps.map((s) => s.lotId).filter(Boolean)
    );
    const participantLots =
      participantLotIds.size > 0
        ? await Promise.all(
            [...participantLotIds].map((id) => ctx.db.get(id as Id<"lots">))
          )
        : [];
    const participantLotsFiltered = participantLots.filter(
      (l): l is NonNullable<typeof l> =>
        l !== null && l.createdBy !== appUser._id
    );

    const seenIds = new Set(createdByLots.map((l) => l._id));
    for (const lot of participantLotsFiltered) {
      if (!seenIds.has(lot._id)) {
        seenIds.add(lot._id);
        createdByLots.push(lot);
      }
    }

    const allowedStepTypes = ROLE_STEP_PERMISSIONS[appUser.role] ?? [];
    for (const stepType of allowedStepTypes) {
      const lotsForStep = await ctx.db
        .query("lots")
        .withIndex("by_nextRequiredStep", (q) =>
          q.eq("nextRequiredStep", stepType)
        )
        .collect();
      for (const lot of lotsForStep) {
        if (!seenIds.has(lot._id)) {
          seenIds.add(lot._id);
          createdByLots.push(lot);
        }
      }
    }

    return createdByLots.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getById = query({
  args: {
    lotId: v.id("lots"),
  },
  returns: v.union(lotValidator, v.null()),
  handler: async (ctx, args) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found",
      });
    }

    const lot = await ctx.db.get(args.lotId);
    if (!lot) {
      return null;
    }

    const lotSteps = await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", args.lotId))
      .collect();
    if (!canAccessLot(appUser, lot, lotSteps)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this lot",
      });
    }

    return lot;
  },
});

export const getByLotNumber = query({
  args: {
    lotNumber: v.string(),
  },
  returns: v.union(lotValidator, v.null()),
  handler: async (ctx, args) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found",
      });
    }

    const lot = await ctx.db
      .query("lots")
      .withIndex("by_lotNumber", (q) => q.eq("lotNumber", args.lotNumber))
      .unique();

    if (!lot) {
      return null;
    }

    const lotSteps = await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", lot._id))
      .collect();
    if (!canAccessLot(appUser, lot, lotSteps)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this lot",
      });
    }

    return lot;
  },
});

/**
 * Admin-only: Backfill nextRequiredStep for lots that don't have it.
 * Run once when enabling strict workflow to fix legacy data.
 */
export const backfillNextRequiredStep = mutation({
  args: {},
  returns: v.object({
    updated: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);
    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found",
      });
    }
    if (appUser.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only admins can run backfill",
      });
    }

    const lots = await ctx.db.query("lots").collect();
    let updated = 0;
    let skipped = 0;
    const now = Date.now();

    for (const lot of lots) {
      if (lot.nextRequiredStep !== undefined) {
        skipped += 1;
        continue;
      }
      const steps = await ctx.db
        .query("steps")
        .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", lot._id))
        .order("asc")
        .collect();
      const existingTypes = steps.map((s) => s.type);
      const nextStep = getNextStepType(existingTypes);
      await ctx.db.patch(lot._id, {
        nextRequiredStep: nextStep ?? null,
        updatedAt: now,
      });
      updated += 1;
    }

    return { updated, skipped };
  },
});
