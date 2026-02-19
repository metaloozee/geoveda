import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAppUser, requireAuthWithWallet } from "./lib/permissions";
import { anchorStatus, stepType } from "./lib/validators";
import { canAccessLot } from "./lib/workflow";

const stepWithAnchorValidator = v.object({
  _id: v.id("steps"),
  _creationTime: v.number(),
  lotId: v.id("lots"),
  type: stepType,
  title: v.string(),
  description: v.optional(v.string()),
  actorId: v.id("users"),
  actorWalletAddress: v.optional(v.string()),
  actorRole: v.string(),
  timestamp: v.number(),
  anchor: v.union(
    v.object({
      _id: v.id("anchors"),
      status: anchorStatus,
      txHash: v.string(),
      dataHash: v.string(),
      chainId: v.number(),
      blockNumber: v.number(),
      contractAddress: v.string(),
      eventName: v.string(),
      verifiedAt: v.optional(v.number()),
      verificationError: v.optional(v.string()),
      anchoredAt: v.number(),
    }),
    v.null()
  ),
});

export const listByLot = query({
  args: {
    lotId: v.id("lots"),
  },
  returns: v.array(stepWithAnchorValidator),
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

    const stepsWithAnchors = await Promise.all(
      lotSteps.map(async (step) => {
        const anchor = await ctx.db
          .query("anchors")
          .withIndex("by_stepId", (q) => q.eq("stepId", step._id))
          .unique();

        return {
          ...step,
          anchor: anchor
            ? {
                _id: anchor._id,
                status: anchor.status,
                txHash: anchor.txHash,
                dataHash: anchor.dataHash,
                chainId: anchor.chainId,
                blockNumber: anchor.blockNumber,
                contractAddress: anchor.contractAddress,
                eventName: anchor.eventName,
                verifiedAt: anchor.verifiedAt,
                verificationError: anchor.verificationError,
                anchoredAt: anchor.anchoredAt,
              }
            : null,
        };
      })
    );

    return stepsWithAnchors;
  },
});

export const add = mutation({
  args: {
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: (_ctx, _args) => {
    throw new ConvexError({
      code: "ANCHORING_REQUIRED",
      message:
        "Direct step creation is disabled. Submit an on-chain anchor and call anchors.verifyAnchorAndCreateStep.",
    });
  },
});
