# Phase 5: On-Chain Anchoring

## Overview
Phase 5 of GeoVeda focuses on establishing a "Root of Trust" by anchoring traceability data to the Ethereum blockchain. The goal is to provide tamper-evident proof of existence and integrity for every step in a product's lifecycle without the prohibitive costs and privacy concerns of storing full datasets on-chain.

By storing only cryptographic hashes, GeoVeda maintains high performance and data privacy while benefiting from the immutable security of public blockchains.

## Data Hashing
To ensure consistency, data must be normalized before hashing.

### Hashing Algorithm
- **Algorithm**: Keccak-256 (standard Ethereum hashing function).
- **Format**: Hex-encoded string with `0x` prefix.

### Data Normalization
A Step's hash is calculated based on the following fields:
- `id`: The unique identifier of the step.
- `productId`: Reference to the product.
- `actorId`: Reference to the entity performing the action.
- `timestamp`: UTC ISO string.
- `location`: Geo-coordinates or facility ID.
- `payload`: The specific data for that step (e.g., temperature, weight).

**Normalization Process**:
1. Sort all keys alphabetically.
2. Remove any transient fields (e.g., `_id`, `_creationTime` from Convex).
3. Stringify to JSON.
4. Hash the resulting string.

```typescript
import { keccak256, encodePacked } from "viem";

const normalizedData = JSON.stringify(sortKeys(stepData));
const stepHash = keccak256(encodePacked(["string"], [normalizedData]));
```

## Anchoring Flow
The anchoring process follows a strictly defined sequence to ensure data consistency between Convex and the blockchain.

1. **Step Creation**: A new traceability step is recorded in Convex.
2. **Hash Generation**: The backend calculates the Keccak-256 hash of the normalized step data.
3. **Transaction Execution**:
   - A transaction is sent to the Ethereum network (or a supported Layer 2).
   - The `stepHash` is included in the `data` (input) field of the transaction.
   - The transaction is typically sent to a "null" address or a dedicated GeoVeda Registry contract.
4. **Anchoring Update**:
   - Once the transaction is mined, the `txHash` and `blockNumber` are returned.
   - The Step record in Convex is updated with these anchoring details.

## Verification
Any stakeholder can verify the integrity of a Step by following these steps:

1. **Recalculate**: Fetch the Step data from Convex and recalculate the Keccak-256 hash using the standard normalization rules.
2. **Fetch On-Chain Proof**: Use the `txHash` stored in the Step record to retrieve the transaction from the blockchain via a provider (e.g., Infura, Alchemy).
3. **Compare**: Extract the data from the on-chain transaction and verify it matches the recalculated hash.

If the hashes match, the data is guaranteed to be identical to what was anchored at the recorded `blockNumber`.

## Security
- **Immutability**: The Ethereum blockchain's consensus mechanism ensures that once a transaction is confirmed, it cannot be altered.
- **Privacy**: No sensitive business logic or PII (Personally Identifiable Information) is stored on-chain. Only an opaque hash is public.
- **Tamper Evidence**: Any modification to the data in Convex will result in a different hash, failing the verification check against the on-chain record.

## Future Enhancements
- **Merkle Tree Batching**: To reduce costs, multiple steps can be aggregated into a Merkle Tree. Only the Merkle Root is anchored on-chain.
- **Layer 2 Integration**: Utilizing Rollups (Arbitrum, Optimism) or Sidechains (Polygon) to significantly reduce transaction fees while maintaining high security.
- **Smart Contract Registry**: Implementing a Solidity contract that emits `Anchored(bytes32 indexed dataHash, uint256 timestamp)` events for easier indexing and third-party auditing.
- **Multi-Chain Support**: Anchoring to multiple chains for increased redundancy and "defense in depth."
