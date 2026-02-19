import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { anchorStatus, stepType } from "./lib/validators";

const userRole = v.union(
  v.literal("farmer"),
  v.literal("processor"),
  v.literal("distributor"),
  v.literal("retailer"),
  v.literal("admin"),
  v.literal("unassigned")
);

const lotStatus = v.union(
  v.literal("created"),
  v.literal("in_progress"),
  v.literal("complete")
);

export default defineSchema({
  users: defineTable({
    walletAddress: v.string(),
    name: v.optional(v.string()),
    role: userRole,
    createdAt: v.number(),
  }).index("by_walletAddress", ["walletAddress"]),

  lots: defineTable({
    lotNumber: v.string(),
    productName: v.string(),
    origin: v.string(),
    status: lotStatus,
    createdBy: v.id("users"),
    nextRequiredStep: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lotNumber", ["lotNumber"])
    .index("by_nextRequiredStep", ["nextRequiredStep"]),

  steps: defineTable({
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
    actorId: v.id("users"),
    actorWalletAddress: v.optional(v.string()),
    actorRole: v.string(),
    timestamp: v.number(),
  })
    .index("by_lot_and_timestamp", ["lotId", "timestamp"])
    .index("by_actorId", ["actorId"]),

  anchors: defineTable({
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
  })
    .index("by_stepId", ["stepId"])
    .index("by_lotId", ["lotId"]),
});
