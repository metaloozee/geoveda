import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAuthWithWallet } from "./lib/permissions";
import {
  canAccessLot,
  getNextStepType,
  isRoleAllowedForStep,
  WORKFLOW_ERROR_CODES,
} from "./lib/workflow";

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

    const lotSteps = await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", args.lotId))
      .order("asc")
      .collect();
    if (!canAccessLot(appUser, lot, lotSteps)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to view this lot",
      });
    }

    return lotSteps;
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

    const existingSteps = await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", args.lotId))
      .order("asc")
      .collect();
    const existingTypes = existingSteps.map((s) => s.type);

    if (!canAccessLot(appUser, lot, existingSteps)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to add steps to this lot",
      });
    }

    const nextRequired = getNextStepType(existingTypes);
    if (lot.status === "complete" || nextRequired == null) {
      throw new ConvexError({
        code: WORKFLOW_ERROR_CODES.LOT_COMPLETE,
        message: "Workflow is complete. No further steps can be added.",
      });
    }

    if (existingTypes.includes(args.type)) {
      throw new ConvexError({
        code: WORKFLOW_ERROR_CODES.STEP_ALREADY_COMPLETED,
        message: `Step type '${args.type}' has already been added to this lot`,
      });
    }
    if (args.type !== nextRequired) {
      throw new ConvexError({
        code: WORKFLOW_ERROR_CODES.INVALID_NEXT_STEP,
        message: `Step type '${args.type}' cannot be added yet. Expected next: '${nextRequired ?? "none"}'`,
      });
    }

    if (!isRoleAllowedForStep(appUser.role, args.type)) {
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

    const newTypes = [...existingTypes, args.type];
    const nextStep = getNextStepType(newTypes);
    let newStatus: "created" | "in_progress" | "complete" = lot.status;
    if (args.type === "retail") {
      newStatus = "complete";
    } else if (lot.status === "created") {
      newStatus = "in_progress";
    }

    await ctx.db.patch(args.lotId, {
      status: newStatus,
      nextRequiredStep: nextStep ?? null,
      updatedAt: now,
    });

    return stepId;
  },
});
