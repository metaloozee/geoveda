import { encodePacked, keccak256 } from "viem";
import type { AnchorPayloadV1 } from "./types";

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    return Object.fromEntries(entries.map(([k, v]) => [k, sortKeysDeep(v)]));
  }

  return value;
}

export function normalizeAnchorPayload(payload: AnchorPayloadV1): string {
  const cleaned: Record<string, unknown> = {
    actorId: payload.actorId,
    actorRole: payload.actorRole,
    actorWalletAddress: payload.actorWalletAddress.toLowerCase(),
    lotId: payload.lotId,
    stepId: payload.stepId,
    timestamp: payload.timestamp,
    title: payload.title,
    type: payload.type,
    version: payload.version,
  };

  if (payload.description && payload.description.trim() !== "") {
    cleaned.description = payload.description;
  }

  return JSON.stringify(sortKeysDeep(cleaned));
}

export function hashAnchorPayload(payload: AnchorPayloadV1): `0x${string}` {
  const normalized = normalizeAnchorPayload(payload);
  return keccak256(encodePacked(["string"], [normalized]));
}

export function hashStepKey(stepId: string): `0x${string}` {
  return keccak256(encodePacked(["string"], [stepId]));
}

export function makeStepIntentKey(input: {
  lotId: string;
  type: string;
  actorWalletAddress: string;
  timestamp: number;
}): `0x${string}` {
  const raw = `${input.lotId}:${input.type}:${input.actorWalletAddress.toLowerCase()}:${input.timestamp}`;
  return keccak256(encodePacked(["string"], [raw]));
}
