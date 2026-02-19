import { ANCHOR_EVENT_NAME } from "@geoveda/anchoring";
import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { stepType } from "./lib/validators";
import {
  canAccessLot,
  getNextStepType,
  isRoleAllowedForStep,
  WORKFLOW_ERROR_CODES,
} from "./lib/workflow";

export const createAnchoredStep = internalMutation({
  args: {
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
    actorId: v.id("users"),
    actorWalletAddress: v.string(),
    timestamp: v.number(),
    txHash: v.string(),
    dataHash: v.string(),
    stepKey: v.string(),
    chainId: v.number(),
    blockNumber: v.number(),
    contractAddress: v.string(),
    txSender: v.string(),
    verifiedAt: v.number(),
  },
  returns: v.id("steps"),
  handler: async (ctx, args) => {
    const appUser = await ctx.db.get(args.actorId);
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
        message: `Step type '${args.type}' cannot be added yet. Expected next: '${nextRequired}'`,
      });
    }

    if (!isRoleAllowedForStep(appUser.role, args.type)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `Role '${appUser.role}' is not authorized to add step type '${args.type}'`,
      });
    }

    const stepId = await ctx.db.insert("steps", {
      lotId: args.lotId,
      type: args.type,
      title: args.title,
      description: args.description,
      actorId: args.actorId,
      actorWalletAddress: args.actorWalletAddress.toLowerCase(),
      actorRole: appUser.role,
      timestamp: args.timestamp,
    });

    await ctx.db.insert("anchors", {
      stepId,
      lotId: args.lotId,
      status: "anchored",
      txHash: args.txHash,
      dataHash: args.dataHash,
      stepKey: args.stepKey,
      chainId: args.chainId,
      blockNumber: args.blockNumber,
      contractAddress: args.contractAddress.toLowerCase(),
      eventName: ANCHOR_EVENT_NAME,
      txSender: args.txSender.toLowerCase(),
      verifiedAt: args.verifiedAt,
      anchoredAt: args.timestamp,
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
      updatedAt: args.timestamp,
    });

    return stepId;
  },
});
