import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAuthWithWallet } from "./lib/permissions";

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

    if (appUser.role === "unassigned") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Cannot create lots with unassigned role",
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

    return await ctx.db
      .query("lots")
      .filter((q) => q.eq(q.field("createdBy"), appUser._id))
      .collect();
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

    const canViewById =
      appUser.role === "admin" || lot.createdBy === appUser._id;
    if (!canViewById) {
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

    const canViewByLotNumber =
      appUser.role === "admin" || lot.createdBy === appUser._id;
    if (!canViewByLotNumber) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this lot",
      });
    }

    return lot;
  },
});
