"use client";

import { convexQuery } from "@convex-dev/react-query";
import {
  ANCHOR_REGISTRY_CONTRACT_ADDRESS,
  BASE_SEPOLIA_CHAIN_ID,
  hashAnchorPayload,
  makeStepIntentKey,
  type StepType,
} from "@geoveda/anchoring";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { env } from "@geoveda/env/web";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { ConvexError } from "convex/values";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import type { WaitForTransactionReceiptErrorType } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getNextStepMessage,
  getNextStepType,
  isRoleAllowedForStep,
  WORKFLOW_ERROR_CODES,
} from "@/lib/workflow";

interface StepRecord {
  type: string;
}

interface AddStepFormProps {
  lotId: Id<"lots">;
  steps: StepRecord[];
  lotStatus: string;
}

interface PendingAnchorSubmission {
  lotId: Id<"lots">;
  type: StepType;
  title: string;
  description?: string;
  actorWalletAddress: string;
  timestamp: number;
  stepKey: `0x${string}`;
  dataHash: `0x${string}`;
  txHash?: `0x${string}`;
  chainId: number;
  contractAddress: `0x${string}`;
}

const formatStepAction = (step: string) =>
  step.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/;
const TX_RECEIPT_TIMEOUT_MS = 90_000;
const PENDING_ANCHOR_STORAGE_KEY = "geoveda.pendingAnchorSubmission";

const anchorStepAbi = [
  {
    type: "function",
    name: "anchorStep",
    inputs: [
      {
        name: "dataHash",
        type: "bytes32",
      },
      {
        name: "stepKey",
        type: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

const legacyAnchorStepAbi = [
  {
    type: "function",
    name: "anchorStep",
    inputs: [
      {
        name: "dataHash",
        type: "bytes32",
      },
      {
        name: "stepKey",
        type: "bytes32",
      },
      {
        name: "actor",
        type: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

function normalizeWalletAddress(value: string): string {
  const match = value.match(ETH_ADDRESS_PATTERN);
  if (!match) {
    return value.toLowerCase();
  }
  return match[0].toLowerCase();
}

function getAddStepErrorMessage(err: unknown): string {
  if (err instanceof ConvexError) {
    const data = err.data as { code?: string; message?: string };
    switch (data.code) {
      case WORKFLOW_ERROR_CODES.STEP_ALREADY_COMPLETED:
        return "This step has already been recorded for this lot.";
      case WORKFLOW_ERROR_CODES.INVALID_NEXT_STEP:
        return data.message ?? "Step cannot be added yet.";
      case WORKFLOW_ERROR_CODES.LOT_COMPLETE:
        return "Workflow is complete. No further steps can be added.";
      case "FORBIDDEN":
        return data.message ?? "You do not have permission.";
      case "ANCHORING_REQUIRED":
      case "ANCHOR_NOT_FOUND":
      case "ANCHOR_MISMATCH":
      case "INVALID_CHAIN":
        return data.message ?? "On-chain anchor verification failed.";
      default:
        return data.message ?? "Failed to add step.";
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Failed to add step.";
}

function getPendingAnchorSubmission(): PendingAnchorSubmission | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PENDING_ANCHOR_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingAnchorSubmission;
  } catch {
    window.localStorage.removeItem(PENDING_ANCHOR_STORAGE_KEY);
    return null;
  }
}

function setPendingAnchorSubmission(record: PendingAnchorSubmission): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PENDING_ANCHOR_STORAGE_KEY,
    JSON.stringify(record)
  );
}

function clearPendingAnchorSubmission(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_ANCHOR_STORAGE_KEY);
}

function canReusePendingAnchorSubmission(
  record: PendingAnchorSubmission,
  params: {
    lotId: Id<"lots">;
    type: StepType;
    title: string;
    description?: string;
    actorWalletAddress: string;
    chainId: number;
    contractAddress: `0x${string}`;
  }
): boolean {
  const normalizedRecordDescription = record.description ?? "";
  const normalizedRequestDescription = params.description ?? "";

  return (
    record.lotId === params.lotId &&
    record.type === params.type &&
    record.title === params.title &&
    normalizedRecordDescription === normalizedRequestDescription &&
    record.actorWalletAddress === params.actorWalletAddress &&
    record.chainId === params.chainId &&
    record.contractAddress.toLowerCase() ===
      params.contractAddress.toLowerCase()
  );
}

export function AddStepForm({ lotId, steps, lotStatus }: AddStepFormProps) {
  const convex = useConvex();
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { data: user } = useQuery(convexQuery(api.users.getCurrent, {}));
  const { mutateAsync: addStep, isPending } = useMutation({
    mutationFn: async ({
      title,
      description,
      type,
    }: {
      title: string;
      description?: string;
      type: StepType;
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: true
    }) => {
      if (!(address && walletClient && publicClient && user)) {
        throw new Error("Wallet and user session are required");
      }

      const sessionWallet = normalizeWalletAddress(user.walletAddress);
      const connectedWallet = normalizeWalletAddress(address);
      if (sessionWallet !== connectedWallet) {
        throw new Error(
          "Connected wallet does not match your signed-in wallet. Reconnect with the same wallet used for SIWE."
        );
      }

      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        throw new Error("Please switch wallet network to Base Sepolia");
      }

      const contractAddress =
        (env.NEXT_PUBLIC_ANCHOR_REGISTRY_CONTRACT_ADDRESS ??
          ANCHOR_REGISTRY_CONTRACT_ADDRESS) as `0x${string}` | "";

      if (!contractAddress) {
        throw new Error("Anchor registry contract is not configured");
      }

      const pendingSubmission = getPendingAnchorSubmission();
      let anchorSubmission: PendingAnchorSubmission;

      if (
        pendingSubmission &&
        canReusePendingAnchorSubmission(pendingSubmission, {
          lotId,
          type,
          title,
          description,
          actorWalletAddress: sessionWallet,
          chainId: BASE_SEPOLIA_CHAIN_ID,
          contractAddress,
        })
      ) {
        anchorSubmission = pendingSubmission;
      } else {
        const timestamp = Date.now();
        const stepKey = makeStepIntentKey({
          lotId,
          type,
          actorWalletAddress: sessionWallet,
          timestamp,
        });
        const dataHash = hashAnchorPayload({
          version: "1",
          stepId: stepKey,
          lotId,
          type,
          title,
          description,
          actorId: user._id,
          actorWalletAddress: sessionWallet,
          actorRole: user.role,
          timestamp,
        });

        anchorSubmission = {
          lotId,
          type,
          title,
          description,
          actorWalletAddress: sessionWallet,
          timestamp,
          stepKey,
          dataHash,
          chainId: BASE_SEPOLIA_CHAIN_ID,
          contractAddress,
        };
        setPendingAnchorSubmission(anchorSubmission);
      }

      let txHash = anchorSubmission.txHash;
      if (!txHash) {
        try {
          txHash = await walletClient.writeContract({
            abi: anchorStepAbi,
            address: contractAddress,
            functionName: "anchorStep",
            args: [anchorSubmission.dataHash, anchorSubmission.stepKey],
            account: sessionWallet as `0x${string}`,
            chain: walletClient.chain,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message.toLowerCase() : "";
          const shouldRetryLegacy =
            errorMessage.includes("reverted") ||
            errorMessage.includes("selector") ||
            errorMessage.includes("function");

          if (!shouldRetryLegacy) {
            throw error;
          }

          txHash = await walletClient.writeContract({
            abi: legacyAnchorStepAbi,
            address: contractAddress,
            functionName: "anchorStep",
            args: [
              anchorSubmission.dataHash,
              anchorSubmission.stepKey,
              sessionWallet as `0x${string}`,
            ],
            account: sessionWallet as `0x${string}`,
            chain: walletClient.chain,
          });
        }

        anchorSubmission = {
          ...anchorSubmission,
          txHash,
        };
        setPendingAnchorSubmission(anchorSubmission);
      }

      try {
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: TX_RECEIPT_TIMEOUT_MS,
        });
      } catch (error) {
        const waitError = error as WaitForTransactionReceiptErrorType;
        const isTimeout =
          waitError.name === "WaitForTransactionReceiptTimeoutError";
        if (isTimeout) {
          throw new Error(
            "Transaction confirmation timed out. Please check your wallet/explorer and retry."
          );
        }
        throw new Error("Failed to confirm transaction on Base Sepolia.");
      }

      try {
        const stepId = await convex.action(
          api.anchorsActions.verifyAnchorAndCreateStep,
          {
            lotId,
            type,
            title,
            description,
            timestamp: anchorSubmission.timestamp,
            txHash,
            dataHash: anchorSubmission.dataHash,
            stepKey: anchorSubmission.stepKey,
            chainId: BASE_SEPOLIA_CHAIN_ID,
            contractAddress,
          }
        );
        clearPendingAnchorSubmission();
        return stepId;
      } catch (error) {
        setPendingAnchorSubmission({
          ...anchorSubmission,
          txHash,
        });
        throw error;
      }
    },
  });

  const existingTypes = steps.map((s) => s.type);
  const nextStep = getNextStepType(existingTypes);
  const isComplete = lotStatus === "complete" || nextStep === null;
  let canPerformNextStep = false;
  if (user?.role && nextStep) {
    canPerformNextStep = isRoleAllowedForStep(user.role, nextStep);
  }

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (!canPerformNextStep) {
        return;
      }
      if (!nextStep) {
        return;
      }
      try {
        await addStep({
          type: nextStep,
          title: value.title,
          description: value.description || undefined,
        });
        toast.success("Step anchored and recorded successfully");
        form.reset();
      } catch (err) {
        toast.error(getAddStepErrorMessage(err));
      }
    },
  });

  const statusMessage = getNextStepMessage(nextStep, user?.role ?? "");

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Update</CardTitle>
          <CardDescription>Record a new step in the journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Workflow complete. No further steps can be added.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Update</CardTitle>
        <CardDescription>{statusMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Title is required",
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Title</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  data-testid="step-title"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Quality Grade A"
                  value={field.state.value}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Textarea
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Additional details..."
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>

          <Button
            className="w-full"
            data-testid="add-step"
            disabled={isPending || !nextStep || !canPerformNextStep}
            type="submit"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {nextStep
              ? `Perform ${formatStepAction(nextStep)}`
              : "No Step Available"}
          </Button>
          {!canPerformNextStep && nextStep && (
            <p className="text-center text-muted-foreground text-xs">
              You do not have permission for this step.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
