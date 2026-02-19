import { STEP_VALUES } from "@geoveda/anchoring";
import { v } from "convex/values";

export type StepType = (typeof STEP_VALUES)[number];

const [HARVEST, PROCESS, QUALITY_CHECK, TRANSPORT, RECEIVE, RETAIL] =
  STEP_VALUES;

export const stepType = v.union(
  v.literal(HARVEST),
  v.literal(PROCESS),
  v.literal(QUALITY_CHECK),
  v.literal(TRANSPORT),
  v.literal(RECEIVE),
  v.literal(RETAIL)
);

export const anchorStatus = v.union(
  v.literal("anchored"),
  v.literal("verification_failed"),
  v.literal("legacy_unanchored")
);
