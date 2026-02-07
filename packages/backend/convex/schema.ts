import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Role enum for supply chain actors
const userRole = v.union(
  v.literal("farmer"),
  v.literal("processor"),
  v.literal("distributor"),
  v.literal("retailer"),
  v.literal("admin"),
  v.literal("unassigned")
);

// Lot status enum
const lotStatus = v.union(
  v.literal("created"),
  v.literal("in_progress"),
  v.literal("complete")
);

// Step type enum for supply chain events
const stepType = v.union(
  v.literal("harvest"),
  v.literal("process"),
  v.literal("quality_check"),
  v.literal("transport"),
  v.literal("receive"),
  v.literal("retail")
);

export default defineSchema({
  // Users table - supply chain participants
  users: defineTable({
    walletAddress: v.string(),
    name: v.optional(v.string()),
    role: userRole,
    createdAt: v.number(),
  }).index("by_walletAddress", ["walletAddress"]),

  // Lots table - product batches being tracked
  lots: defineTable({
    lotNumber: v.string(),
    productName: v.string(),
    origin: v.string(),
    status: lotStatus,
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lotNumber", ["lotNumber"]),

  // Steps table - APPEND-ONLY supply chain events
  steps: defineTable({
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
    actorId: v.id("users"),
    actorRole: v.string(), // Denormalized for display
    timestamp: v.number(),
  }).index("by_lot_and_timestamp", ["lotId", "timestamp"]),

  // Anchors table - blockchain anchoring records (Phase 5)
  anchors: defineTable({
    stepId: v.id("steps"),
    lotId: v.id("lots"),
    txHash: v.string(),
    dataHash: v.string(),
    chainId: v.number(),
    anchoredAt: v.number(),
  }).index("by_stepId", ["stepId"]),
});
