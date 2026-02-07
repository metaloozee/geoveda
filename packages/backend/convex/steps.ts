import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAuthWithWallet } from "./lib/permissions";

const ROLE_STEP_PERMISSIONS: Record<string, string[]> = {
  farmer: ["harvest"],
  processor: ["process", "quality_check"],
  distributor: ["transport"],
  retailer: ["receive", "retail"],
  admin: [
    "harvest",
    "process",
    "quality_check",
    "transport",
    "receive",
    "retail",
  ],
};

const stepType = v.union(
  v.literal("harvest"),
  v.literal("process"),
  v.literal("quality_check"),
  v.literal("transport"),
  v.literal("receive"),
  v.literal("retail")
);

const stepValidator = v.object({
  _id: v.id("steps"),
  _creationTime: v.number(),
  lotId: v.id("lots"),
  type: stepType,
  title: v.string(),
  description: v.optional(v.string()),
  actorId: v.id("users"),
  actorRole: v.string(),
  timestamp: v.number(),
});

export const listByLot = query({
  args: {
    lotId: v.id("lots"),
  },
  returns: v.array(stepValidator),
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
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Lot not found",
      });
    }

    const canViewLot =
      appUser.role === "admin" || lot.createdBy === appUser._id;
    if (!canViewLot) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this lot",
      });
    }

    return await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", args.lotId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("steps"),
  handler: async (ctx, args) => {
    const { walletAddress } = await requireAuthWithWallet(ctx);

    const appUser = await getAppUser(ctx, walletAddress);
    if (!appUser) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User profile not found. Please complete registration.",
      });
    }

    const lot = await ctx.db.get(args.lotId);
    if (!lot) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Lot not found",
      });
    }

    const allowedStepTypes = ROLE_STEP_PERMISSIONS[appUser.role] ?? [];
    if (!allowedStepTypes.includes(args.type)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `Role '${appUser.role}' is not authorized to add step type '${args.type}'`,
      });
    }

    const now = Date.now();

    const stepId = await ctx.db.insert("steps", {
      lotId: args.lotId,
      type: args.type,
      title: args.title,
      description: args.description,
      actorId: appUser._id,
      actorRole: appUser.role,
      timestamp: now,
    });

    let newStatus = lot.status;

    if (lot.status === "created") {
      newStatus = "in_progress";
    }

    if (args.type === "retail") {
      newStatus = "complete";
    }

    if (newStatus !== lot.status) {
      await ctx.db.patch(args.lotId, { status: newStatus, updatedAt: now });
    }

    return stepId;
  },
});
