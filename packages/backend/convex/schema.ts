import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

const stepType = v.union(
  v.literal("harvest"),
  v.literal("process"),
  v.literal("quality_check"),
  v.literal("transport"),
  v.literal("receive"),
  v.literal("retail")
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
    actorRole: v.string(),
    timestamp: v.number(),
  })
    .index("by_lot_and_timestamp", ["lotId", "timestamp"])
    .index("by_actorId", ["actorId"]),

  anchors: defineTable({
    stepId: v.id("steps"),
    lotId: v.id("lots"),
    txHash: v.string(),
    dataHash: v.string(),
    chainId: v.number(),
    anchoredAt: v.number(),
  }).index("by_stepId", ["stepId"]),
});
