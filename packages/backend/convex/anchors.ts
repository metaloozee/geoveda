import { v } from "convex/values";
import { query } from "./_generated/server";

const anchorStatus = v.union(
  v.literal("anchored"),
  v.literal("verification_failed"),
  v.literal("legacy_unanchored")
);

const anchorValidator = v.object({
  _id: v.id("anchors"),
  _creationTime: v.number(),
  stepId: v.id("steps"),
  lotId: v.id("lots"),
  status: anchorStatus,
  txHash: v.string(),
  dataHash: v.string(),
  stepKey: v.string(),
  chainId: v.number(),
  blockNumber: v.number(),
  contractAddress: v.string(),
  eventName: v.string(),
  txSender: v.string(),
  verifiedAt: v.optional(v.number()),
  verificationError: v.optional(v.string()),
  anchoredAt: v.number(),
});

export const getByStepId = query({
  args: { stepId: v.id("steps") },
  returns: v.union(anchorValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("anchors")
      .withIndex("by_stepId", (q) => q.eq("stepId", args.stepId))
      .unique();
  },
});

export const listByLot = query({
  args: { lotId: v.id("lots") },
  returns: v.array(anchorValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("anchors")
      .withIndex("by_lotId", (q) => q.eq("lotId", args.lotId))
      .collect();
  },
});
