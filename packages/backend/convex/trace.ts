import { v } from "convex/values";
import { query } from "./_generated/server";

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

const publicLotValidator = v.object({
  lotNumber: v.string(),
  productName: v.string(),
  origin: v.string(),
  status: lotStatus,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const publicStepValidator = v.object({
  type: stepType,
  title: v.string(),
  description: v.optional(v.string()),
  actorRole: v.string(),
  timestamp: v.number(),
});

const traceResponseValidator = v.object({
  lot: publicLotValidator,
  timeline: v.array(publicStepValidator),
});

export const getByLotNumber = query({
  args: {
    lotNumber: v.string(),
  },
  returns: v.union(traceResponseValidator, v.null()),
  handler: async (ctx, args) => {
    const lot = await ctx.db
      .query("lots")
      .withIndex("by_lotNumber", (q) => q.eq("lotNumber", args.lotNumber))
      .unique();

    if (!lot) {
      return null;
    }

    const steps = await ctx.db
      .query("steps")
      .withIndex("by_lot_and_timestamp", (q) => q.eq("lotId", lot._id))
      .order("asc")
      .collect();

    const timeline = steps.map((step) => ({
      type: step.type,
      title: step.title,
      description: step.description,
      actorRole: step.actorRole,
      timestamp: step.timestamp,
    }));

    return {
      lot: {
        lotNumber: lot.lotNumber,
        productName: lot.productName,
        origin: lot.origin,
        status: lot.status,
        createdAt: lot.createdAt,
        updatedAt: lot.updatedAt,
      },
      timeline,
    };
  },
});
