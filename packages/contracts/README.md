# @geoveda/contracts

Solidity contracts and deployment automation for GeoVeda anchoring.

## Prerequisites

- **Foundry installed**: Run `foundryup` (or install from https://book.getfoundry.sh/getting-started/installation)
  - Windows: `curl -L https://foundry.paradigm.xyz | bash` then restart terminal, then `foundryup`
  - Mac/Linux: `curl -L https://foundry.paradigm.xyz | bash` then `foundryup`
- Environment variables copied from `.env.example` and filled in

## Commands

- Build: `bun run build`
- Test: `bun run test`
- Format: `bun run fmt`
- Deploy (Base Sepolia): `bun run deploy:base-sepolia`
- Verify (Base Sepolia): `bun run verify:base-sepolia`

## Deployment Metadata

After deployment and verification, update `deployments/base-sepolia.json` with:

- `contractAddress`
- `deploymentTxHash`
- `deploymentBlockNumber`
- `verifiedUrl`
- `deployedAt`
