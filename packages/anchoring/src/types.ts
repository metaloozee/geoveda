export const STEP_VALUES = [
  "harvest",
  "process",
  "quality_check",
  "transport",
  "receive",
  "retail",
] as const;

export type StepType = (typeof STEP_VALUES)[number];

export interface AnchorPayloadV1 {
  version: "1";
  stepId: string;
  lotId: string;
  type: StepType;
  title: string;
  description?: string;
  actorId: string;
  actorWalletAddress: string;
  actorRole: string;
  timestamp: number;
}

export interface AnchorContractCall {
  dataHash: `0x${string}`;
  stepKey: `0x${string}`;
}
