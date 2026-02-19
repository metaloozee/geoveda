import {
  ANCHOR_EVENT_NAME,
  ANCHOR_REGISTRY_CONTRACT_ADDRESS,
  anchorRegistryAbi,
  BASE_SEPOLIA_CHAIN_ID,
  hashAnchorPayload,
  makeStepIntentKey,
} from "@geoveda/anchoring";
import { env } from "@geoveda/env/backend";
import { ConvexError, v } from "convex/values";
import { createPublicClient, decodeEventLog, http } from "viem";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { stepType } from "./lib/validators";

export const verifyAnchorAndCreateStep: ReturnType<typeof action> = action({
  args: {
    lotId: v.id("lots"),
    type: stepType,
    title: v.string(),
    description: v.optional(v.string()),
    timestamp: v.number(),
    txHash: v.string(),
    dataHash: v.string(),
    stepKey: v.string(),
    chainId: v.number(),
    contractAddress: v.string(),
  },
  returns: v.id("steps"),
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: action performs sequential auth, chain verification, and idempotency checks
  handler: async (ctx, args): Promise<Id<"steps">> => {
    const appUser = await ctx.runQuery(api.users.getCurrent, {});
    if (!appUser) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      });
    }

    const normalizedTxHash = args.txHash.toLowerCase();
    const normalizedDataHash = args.dataHash.toLowerCase();
    const normalizedStepKey = args.stepKey.toLowerCase();

    const existingAnchor = await ctx.runQuery(
      internal.anchorsInternal.findByLotAndTxHash,
      {
        lotId: args.lotId,
        txHash: normalizedTxHash,
      }
    );

    if (existingAnchor) {
      const existingDataHash = existingAnchor.dataHash.toLowerCase();
      const existingStepKey = existingAnchor.stepKey.toLowerCase();

      if (
        existingDataHash === normalizedDataHash &&
        existingStepKey === normalizedStepKey
      ) {
        return existingAnchor.stepId;
      }
    }

    const actorWalletAddress = appUser.walletAddress.toLowerCase();
    const configuredContractAddress =
      env.ANCHOR_REGISTRY_CONTRACT_ADDRESS || ANCHOR_REGISTRY_CONTRACT_ADDRESS;
    if (!configuredContractAddress) {
      throw new ConvexError({
        code: "MISSING_CONTRACT_ADDRESS",
        message:
          "ANCHOR_REGISTRY_CONTRACT_ADDRESS must be configured on the server.",
      });
    }

    if (args.chainId !== BASE_SEPOLIA_CHAIN_ID) {
      throw new ConvexError({
        code: "INVALID_CHAIN",
        message: `Expected chain ${BASE_SEPOLIA_CHAIN_ID}, got ${args.chainId}`,
      });
    }

    const expectedStepKey = makeStepIntentKey({
      lotId: args.lotId,
      type: args.type,
      actorWalletAddress,
      timestamp: args.timestamp,
    });

    const expectedDataHash = hashAnchorPayload({
      version: "1",
      stepId: expectedStepKey,
      lotId: args.lotId,
      type: args.type,
      title: args.title,
      description: args.description,
      actorId: appUser._id,
      actorWalletAddress,
      actorRole: appUser.role,
      timestamp: args.timestamp,
    });

    if (normalizedStepKey !== expectedStepKey.toLowerCase()) {
      throw new ConvexError({
        code: "ANCHOR_MISMATCH",
        message: "Step key mismatch",
      });
    }

    if (normalizedDataHash !== expectedDataHash.toLowerCase()) {
      throw new ConvexError({
        code: "ANCHOR_MISMATCH",
        message: "Data hash mismatch",
      });
    }

    let blockNumber = 0;
    let txSender = actorWalletAddress;

    if (process.env.CONVEX_TEST_SKIP_ANCHOR_RPC !== "true") {
      if (!env.BASE_SEPOLIA_RPC_URL) {
        throw new ConvexError({
          code: "MISSING_RPC",
          message: "BASE_SEPOLIA_RPC_URL is required",
        });
      }

      const client = createPublicClient({
        transport: http(env.BASE_SEPOLIA_RPC_URL),
      });

      let receipt: Awaited<ReturnType<typeof client.getTransactionReceipt>>;
      try {
        receipt = await client.getTransactionReceipt({
          hash: args.txHash as `0x${string}`,
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new ConvexError({
          code: "ANCHOR_RECEIPT_FETCH_FAILED",
          message: `Failed to fetch transaction receipt for ${args.txHash}: ${reason}`,
        });
      }

      if (!receipt) {
        throw new ConvexError({
          code: "ANCHOR_RECEIPT_NOT_FOUND",
          message: `Transaction receipt not found for ${args.txHash}`,
        });
      }

      const matchingLog = receipt.logs.find((log) => {
        if (
          log.address.toLowerCase() !== configuredContractAddress.toLowerCase()
        ) {
          return false;
        }

        try {
          const decoded = decodeEventLog({
            abi: anchorRegistryAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName !== ANCHOR_EVENT_NAME) {
            return false;
          }

          return (
            String(decoded.args.dataHash).toLowerCase() ===
              normalizedDataHash &&
            String(decoded.args.stepKey).toLowerCase() === normalizedStepKey &&
            String(decoded.args.actor).toLowerCase() === actorWalletAddress
          );
        } catch {
          return false;
        }
      });

      if (!matchingLog) {
        throw new ConvexError({
          code: "ANCHOR_NOT_FOUND",
          message: "Could not find matching Anchored event for transaction",
        });
      }

      blockNumber = Number(receipt.blockNumber);
      txSender = receipt.from.toLowerCase();

      if (txSender !== actorWalletAddress) {
        throw new ConvexError({
          code: "ANCHOR_MISMATCH",
          message: "Transaction sender does not match authenticated wallet",
        });
      }
    }

    return await ctx.runMutation(internal.anchorsInternal.createAnchoredStep, {
      lotId: args.lotId,
      type: args.type,
      title: args.title,
      description: args.description,
      actorId: appUser._id,
      actorWalletAddress,
      timestamp: args.timestamp,
      txHash: normalizedTxHash,
      dataHash: normalizedDataHash,
      stepKey: normalizedStepKey,
      chainId: args.chainId,
      blockNumber,
      contractAddress: configuredContractAddress,
      txSender,
      verifiedAt: Date.now(),
    });
  },
});
