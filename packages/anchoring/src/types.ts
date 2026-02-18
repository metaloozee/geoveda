export interface AnchorPayloadV1 {
  version: "1";
  stepId: string;
  lotId: string;
  type: string;
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
  actor: `0x${string}`;
}
