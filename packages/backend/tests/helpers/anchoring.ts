import {
  hashAnchorPayload,
  makeStepIntentKey,
  type StepType,
} from "@geoveda/anchoring";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { BackendTest } from "../harness";
import { asWallet } from "./auth";

export async function addAnchoredStep(
  t: BackendTest,
  input: {
    walletAddress: string;
    actorId: Id<"users">;
    actorRole: string;
    lotId: Id<"lots">;
    type: StepType;
    title: string;
    description?: string;
  }
) {
  const timestamp = Date.now();
  const stepKey = makeStepIntentKey({
    lotId: input.lotId,
    type: input.type,
    actorWalletAddress: input.walletAddress,
    timestamp,
  });
  const dataHash = hashAnchorPayload({
    version: "1",
    stepId: stepKey,
    lotId: input.lotId,
    type: input.type,
    title: input.title,
    description: input.description,
    actorId: input.actorId,
    actorWalletAddress: input.walletAddress,
    actorRole: input.actorRole,
    timestamp,
  });

  return await asWallet(t, input.walletAddress).action(
    api.anchorsActions.verifyAnchorAndCreateStep,
    {
      lotId: input.lotId,
      type: input.type,
      title: input.title,
      description: input.description,
      timestamp,
      txHash: `0x${"1".repeat(64)}`,
      dataHash,
      stepKey,
      chainId: 84_532,
      contractAddress: "0x1111111111111111111111111111111111111111",
    }
  );
}
