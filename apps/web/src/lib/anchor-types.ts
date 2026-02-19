export interface AnchorInfo {
  status: "anchored" | "verification_failed" | "legacy_unanchored";
  txHash: string;
  chainId: number;
  blockNumber: number;
}
