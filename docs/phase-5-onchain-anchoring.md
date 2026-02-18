# Phase 5: On-Chain Anchoring

## Overview
Phase 5 of GeoVeda focuses on establishing a "Root of Trust" by anchoring traceability data to the Ethereum blockchain. The goal is to provide tamper-evident proof of existence and integrity for every step in a product's lifecycle without the prohibitive costs and privacy concerns of storing full datasets on-chain.

By storing only cryptographic hashes, GeoVeda maintains high performance and data privacy while benefiting from the immutable security of public blockchains.

## Base Docs MCP (Required Reference)
Use the `base-docs` MCP server as the canonical source for Base and Base Sepolia implementation details (network config, wallet patterns, contract/event guidance, and tooling updates).

### Install in Cursor
1. Open Cursor MCP settings and add the Base docs server.
2. Ensure `.cursor/mcp.json` contains:

```json
{
  "mcpServers": {
    "base-docs": {
      "url": "https://docs.base.org/mcp"
    }
  }
}
```

### Verify installation
- Confirm the MCP server is available in your tool list as `base-docs`.
- Run a test query against the server before implementation work.
- Prefer MCP results over static docs when the two differ.

## Data Hashing
To ensure consistency, data must be normalized before hashing.

### Hashing Algorithm
- **Algorithm**: Keccak-256 (standard Ethereum hashing function).
- **Format**: Hex-encoded string with `0x` prefix.

### Data Normalization
A Step's hash is calculated based on the following fields:
- `stepId`: Deterministic step intent key.
- `lotId`: Reference to the lot.
- `actorId`: Reference to the entity performing the action.
- `actorWalletAddress`: Authenticated SIWE wallet.
- `actorRole`: Application role used for workflow authorization.
- `timestamp`: Unix timestamp in milliseconds.
- `type`, `title`, `description`: Step content fields.
- `version`: Hash payload format version.

**Normalization Process**:
1. Sort all keys alphabetically.
2. Lowercase wallet addresses.
3. Remove empty optional fields.
4. Stringify to JSON.
5. Hash the resulting string.

```typescript
import { hashAnchorPayload, makeStepIntentKey } from "@geoveda/anchoring";

const stepKey = makeStepIntentKey({
  lotId,
  type,
  actorWalletAddress,
  timestamp,
});

const dataHash = hashAnchorPayload({
  version: "1",
  stepId: stepKey,
  lotId,
  actorId,
  actorWalletAddress,
  actorRole,
  timestamp,
  type,
  title,
  description,
});
```

## Anchoring Flow
The anchoring process follows a strict verify-then-persist sequence.

1. **Prepare Anchor Payload**: Frontend computes `stepKey` and `dataHash` from canonical payload.
2. **User Wallet Transaction**:
   - User submits `AnchorRegistry.anchorStep(dataHash, stepKey, actor)` on Base Sepolia.
   - Contract emits `Anchored(bytes32 dataHash, bytes32 stepKey, address actor, uint256 timestamp)`.
3. **Backend Verification Action**:
   - Convex action fetches transaction receipt/logs from Base Sepolia RPC.
   - Validates contract address, event signature, sender wallet, and hash values.
4. **Persist Step + Anchor**:
   - Only after verification succeeds, backend inserts the Step and matching Anchor record.
   - If verification fails, no Step is created.

## Verification
Any stakeholder can verify the integrity of a Step by following these steps:

1. **Recalculate**: Fetch Step data from Convex and recalculate `dataHash` using shared canonical normalization.
2. **Fetch On-Chain Proof**: Use `txHash` to retrieve receipt/logs from Base Sepolia.
3. **Compare**: Confirm `Anchored` event fields (`dataHash`, `stepKey`, `actor`) match backend records.

If values match, the step is anchored and verifiable against the recorded `blockNumber`.

## Required Environment Variables

### Web (`apps/web/.env`)
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID` (default: `84532`)
- `NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL` (default: `https://sepolia.basescan.org`)
- `NEXT_PUBLIC_ANCHOR_REGISTRY_CONTRACT_ADDRESS`

### Backend (`packages/backend/.env.local`)
- `BASE_SEPOLIA_RPC_URL`
- `ANCHOR_REGISTRY_CONTRACT_ADDRESS`

### Contracts (`packages/contracts/.env`)
- `BASE_SEPOLIA_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`
- `BASESCAN_API_KEY`
- `ANCHOR_REGISTRY_CONTRACT_ADDRESS`

## Security
- **Immutability**: The Ethereum blockchain's consensus mechanism ensures that once a transaction is confirmed, it cannot be altered.
- **Privacy**: No sensitive business logic or PII (Personally Identifiable Information) is stored on-chain. Only an opaque hash is public.
- **Tamper Evidence**: Any modification to the data in Convex will result in a different hash, failing the verification check against the on-chain record.

## Future Enhancements
- **Merkle Tree Batching**: To reduce costs, multiple steps can be aggregated into a Merkle Tree. Only the Merkle Root is anchored on-chain.
- **Layer 2 Integration**: Utilizing Rollups (Arbitrum, Optimism) or Sidechains (Polygon) to significantly reduce transaction fees while maintaining high security.
- **Smart Contract Registry**: Implementing a Solidity contract that emits `Anchored(bytes32 indexed dataHash, uint256 timestamp)` events for easier indexing and third-party auditing.
- **Multi-Chain Support**: Anchoring to multiple chains for increased redundancy and "defense in depth."
