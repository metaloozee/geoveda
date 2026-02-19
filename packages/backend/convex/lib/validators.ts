import { v } from "convex/values";

const STEP_VALUES = [
  "harvest",
  "process",
  "quality_check",
  "transport",
  "receive",
  "retail",
] as const;

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
