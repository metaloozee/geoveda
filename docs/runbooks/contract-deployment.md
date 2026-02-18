# AnchorRegistry Deployment Runbook

## Owner

- Core GeoVeda engineering team

## Documentation Source of Truth

- Base integration and network behavior must be validated against the `base-docs` MCP server.
- If local notes conflict with `base-docs` MCP responses, update local docs before deployment.

## Gas Funding

- Deployment gas is paid by the project-owned deployer wallet.

## Base Sepolia Deployment

1. Ensure `BASE_SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` are set.
2. Run `bun run contracts:build`.
3. Run `bun run contracts:test`.
4. Run `bun run contracts:deploy:base-sepolia`.
5. Capture contract address + deployment tx hash.
6. Update `packages/contracts/deployments/base-sepolia.json`.

## Basescan Verification

1. Ensure `BASESCAN_API_KEY` is set.
2. Run `bun run contracts:verify:base-sepolia`.
3. Copy verified URL into `packages/contracts/deployments/base-sepolia.json`.
4. Record URL in release notes.
