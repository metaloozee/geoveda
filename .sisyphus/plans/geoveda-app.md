# Geoveda Traceability MVP (Phases 1–4 + Phase 5 Doc)

## TL;DR

> **Quick Summary**: Build a wallet-only SIWE auth flow on Better-Auth + Convex, define minimal traceability data in Convex, and ship role-based UI flows (lots, steps, timeline) with public QR traceability. Deliver Phase 5 as documentation only.
> 
> **Deliverables**:
> - Convex schema (users, lots, steps, anchors) + indexes
> - RBAC helpers + users/roles mutations & queries
> - Wallet-only SIWE auth (backend + frontend) using wagmi/viem
> - Route groups with shadcn UI: public, app, admin
> - Public trace page with QR scan + manual entry
> - Authenticated lot creation + step logging + QR generation
> - Admin user management (role assignment)
> - Phase 5 on-chain anchoring documentation (.md)
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 8

---

## Context

### Original Request
- Build **Geoveda**, a traceability web app for Ayurvedic products.
- Wallet-only authentication on Ethereum testnet using Better-Auth + Convex.
- On-chain usage is **verification only** (hashes stored on-chain, txHash saved in Convex).
- Roles stored in Convex users table; role changes must take effect immediately.
- Enforce permissions server-side in Convex mutations/queries.
- UI must use **shadcn components only**; load **frontend-design** skill.
- Phases: 1) App skeleton, 2) Convex setup, 3) Wallet auth, 4) Core traceability, 5) On-chain anchoring doc only.

### Interview Summary
**Key Discussions**:
- Roles: farmer, processor, distributor, retailer, admin.
- Wallet library: wagmi + viem.
- QR: camera-based scan + manual entry.
- Tests: **No automated tests**; Agent-Executed QA only.
- Phase 5: documentation only (no on-chain code).

### Research Findings
- `@convex-dev/better-auth` handles JWT + JWKS automatically.
- Better-Auth SIWE plugin integrates cleanly with Convex.
- `ConvexBetterAuthProvider` already in place for token hydration.
- Shadcn base-lyra style configured with neutral theme.

### Metis Review (Gaps Addressed)
- **Admin bootstrap**: default to env allow-list; fallback to first user admin.
- **Lot number generation**: server-generated, deterministic format.
- **Step types**: fixed enum (harvest, process, quality_check, transport, receive, retail).
- **Scope guardrails**: no on-chain code, no lot merge/split, no multi-tenancy.
- **Role display**: show role and masked wallet, not ENS.

---

## Work Objectives

### Core Objective
Deliver a working MVP that lets authenticated supply-chain roles create lots and append immutable steps, while consumers can publicly trace any lot by QR/lot number — all anchored to a wallet-only auth flow.

### Concrete Deliverables
- Convex schema + RBAC helpers + traceability functions.
- Wallet-only auth via SIWE on Better-Auth + Convex JWT.
- Next.js route groups: (public), (app), (admin).
- Public trace page with QR scan & manual search.
- Authenticated lot creation, step logging, and QR generation.
- Admin UI for user role assignment.
- Phase 5 on-chain anchoring doc.

### Definition of Done
- [x] Wallet-only sign-in works end-to-end in dev with wagmi/viem.
- [x] Roles are stored and enforced in Convex (server-side).
- [x] Lots and steps can be created by authorized roles.
- [x] Public trace page renders timeline for any lot number.
- [x] Admin can assign roles and changes take effect immediately.
- [x] Phase 5 documentation exists and explains on-chain anchoring clearly.

### Must Have
- Wallet-only SIWE auth (no email/password fallback).
- Roles stored in Convex users table.
- Server-side RBAC enforced in mutations/queries.
- Public trace UI + QR scan/manual entry.
- shadcn-only UI components.

### Must NOT Have (Guardrails)
- No on-chain transactions or smart contract code (Phase 5 is doc only).
- No email/password auth.
- No lot merge/split or multi-tenancy.
- No file uploads or analytics dashboards.

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
> All verification must be executable by the agent. No manual steps.

### Test Decision
- **Infrastructure exists**: NO (no test framework)
- **Automated tests**: NONE
- **Framework**: none

### Agent-Executed QA Scenarios
All tasks include executable QA steps using Bash/Playwright. UI flows rely on Playwright. Backend checks use `bunx convex run` or HTTP calls.

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
├── Task 1: Convex schema + indexes
├── Task 4: SIWE auth (backend)
├── Task 6: Route groups + layouts
└── Task 10: Phase 5 documentation

Wave 2 (After Wave 1):
├── Task 2: RBAC helpers + users
└── Task 5: Wallet auth UI + wagmi providers

Wave 3 (After Wave 2):
└── Task 3: Lots/steps/trace functions

Wave 4 (After Wave 3):
├── Task 7: Public trace + QR scan
├── Task 8: Authenticated traceability flows
└── Task 9: Admin user management

Critical Path: Task 1 → Task 2 → Task 3 → Task 8

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|----------------------|
| 1 | None | 2, 3 | 4, 6, 10 |
| 2 | 1 | 3, 9 | 5 |
| 3 | 1, 2 | 7, 8 | — |
| 4 | None | 5 | 1, 6, 10 |
| 5 | 4 | 8, 9 | 2 |
| 6 | None | 7, 8, 9 | 1, 4, 10 |
| 7 | 3, 6 | — | 8, 9 |
| 8 | 3, 5, 6 | — | 7, 9 |
| 9 | 2, 5, 6 | — | 7, 8 |
| 10 | None | — | 1, 4, 6 |

### Agent Dispatch Summary
| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1, 4, 6, 10 | backend: `convex-best-practices`, auth: `better-auth-best-practices`, UI: `frontend-design`, docs: category `writing` |
| 2 | 2, 5 | `convex-functions`, `convex-security-check`, `frontend-design` |
| 3 | 3 | `convex-functions`, `convex-best-practices` |
| 4 | 7, 8, 9 | `frontend-design` |

---

## TODOs

> Implementation + QA = ONE task. Each task includes Agent-Executed QA scenarios.

- [x] 1. Define Convex schema + indexes (users, lots, steps, anchors)

  **What to do**:
  - Update `packages/backend/convex/schema.ts` to define tables with minimal MVP fields.
    - `users`: walletAddress, name?, role, createdAt
    - `lots`: lotNumber, productName, origin, status, createdBy, createdAt, updatedAt
    - `steps`: lotId, type, title, description?, actorId, actorRole, timestamp (append-only)
    - `anchors`: stepId, lotId, txHash, dataHash, chainId, anchoredAt (future)
  - Add enums: roles, lot status, step type.
  - Add indexes: `users.by_walletAddress`, `lots.by_lotNumber`, `steps.by_lot_and_timestamp`, `anchors.by_stepId`.

  **Must NOT do**:
  - Add unnecessary fields (keep MVP minimal).
  - Add on-chain logic or file storage.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: backend schema design with multiple tables and indexes.
  - **Skills**: `convex-schema-validator`, `convex-best-practices`
    - `convex-schema-validator`: ensures schema and indexes are idiomatic.
    - `convex-best-practices`: helps keep schema MVP-focused.
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: UI not relevant.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 4, 6, 10)
  - **Blocks**: Tasks 2, 3
  - **Blocked By**: None

  **References**:
  - `packages/backend/convex/schema.ts` — currently empty; replace with full schema.
  - `packages/backend/convex/README.md` — Convex patterns and file conventions.
  - Convex docs: https://docs.convex.dev/database/schemas — table/index syntax.

  **Acceptance Criteria**:
  - [ ] `schema.ts` defines `users`, `lots`, `steps`, `anchors` with indexes.
  - [ ] `bunx convex dev --once` completes with exit code 0 (no schema errors).
  - [ ] `_generated/dataModel.d.ts` includes all four tables.

  **Agent-Executed QA Scenarios**:

  Scenario: Schema deploys without errors
    Tool: Bash
    Preconditions: Convex dev environment configured
    Steps:
      1. Run: `bunx convex dev --once 2>&1 | tee .sisyphus/evidence/task-1-schema-deploy.txt`
      2. Assert: exit code is 0
      3. Assert: output does not contain "Schema validation failed"
    Expected Result: Schema deploys successfully
    Evidence: `.sisyphus/evidence/task-1-schema-deploy.txt`

  Scenario: Generated data model lists all tables
    Tool: Bash
    Preconditions: Schema deployed
    Steps:
      1. Run: `node -e "const fs=require('fs');const dm=fs.readFileSync('packages/backend/convex/_generated/dataModel.d.ts','utf8');['users','lots','steps','anchors'].forEach(t=>{if(!dm.includes('\"'+t+'\"')) process.exit(1);});"`
      2. Assert: exit code is 0
    Expected Result: dataModel contains expected table names

  **Commit**: YES (group with Task 2 or 3)

- [x] 2. Add RBAC helpers + user bootstrap + role management

  **What to do**:
  - Create `convex/lib/permissions.ts` with `requireAuth`, `requireRole`, `requireAdmin`.
  - Add `convex/users.ts` with:
    - `getCurrent` (returns user + role for current auth identity)
    - `ensureUser` (upsert by walletAddress)
    - `list` (admin only)
    - `setRole` (admin only)
  - Admin bootstrap logic:
    - If wallet is in `ADMIN_WALLET_ADDRESSES` env → role = admin
    - Else if no admin exists → first user becomes admin
    - Else default role = `unassigned`

  **Must NOT do**:
  - Store roles only in JWT.
  - Allow role changes from non-admin.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: authorization logic and security rules.
  - **Skills**: `convex-functions`, `convex-security-check`
    - `convex-functions`: implement queries/mutations correctly.
    - `convex-security-check`: enforce RBAC safely.
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: UI not relevant.

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 1)
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: Tasks 3, 9
  - **Blocked By**: Task 1

  **References**:
  - `packages/backend/convex/auth.ts` — uses `authComponent.safeGetAuthUser` pattern.
  - `packages/backend/convex/private-data.ts` — example auth check.
  - `packages/backend/convex/schema.ts` — `users` table definition.
  - Convex auth docs: https://docs.convex.dev/auth

  **Acceptance Criteria**:
  - [ ] `ensureUser` creates or returns user with role.
  - [ ] `setRole` rejects non-admin access.
  - [ ] `getCurrent` returns role and wallet address.

  **Agent-Executed QA Scenarios**:

  Scenario: Non-admin cannot change roles
    Tool: Bash
    Preconditions: Convex dev running
    Steps:
      1. Run: `bunx convex run api.users.setRole --args '{"userId":"SOME_ID","role":"farmer"}' 2>&1 | tee .sisyphus/evidence/task-2-nonadmin-deny.txt`
      2. Assert: output contains "Unauthorized" or "Not authenticated"
    Expected Result: Role change is rejected
    Evidence: `.sisyphus/evidence/task-2-nonadmin-deny.txt`

  Scenario: Admin can set role
    Tool: Bash
    Preconditions: `ADMIN_WALLET_ADDRESSES` includes `0xADMIN...`
    Steps:
      1. Run: `bunx convex run --identity '{"subject":"0xADMIN","issuer":"https://better-auth"}' api.users.ensureUser`
      2. Run: `bunx convex run --identity '{"subject":"0xADMIN","issuer":"https://better-auth"}' api.users.list`
      3. Run: `bunx convex run --identity '{"subject":"0xADMIN","issuer":"https://better-auth"}' api.users.setRole --args '{"userId":"<from list>","role":"processor"}'`
      4. Assert: setRole returns updated role
    Expected Result: Admin role change succeeds

  **Commit**: YES (group with Task 1)

- [x] 3. Implement lots/steps/trace functions with RBAC

  **What to do**:
  - Create `convex/lots.ts` with `create`, `list`, `getById`, `getByLotNumber`.
  - Create `convex/steps.ts` with `listByLot`, `add` (append-only).
  - Create `convex/trace.ts` with public `getByLotNumber` returning sanitized timeline.
  - Enforce step type permissions by role:
    - farmer → harvest
    - processor → process, quality_check
    - distributor → transport
    - retailer → receive, retail
    - admin → all
  - Auto-generate `lotNumber` server-side (e.g., `LOT-YYYYMMDD-XXXXXX`).
  - Update lot status when steps are added (default: `created` → `in_progress` after first step → `complete` when step type is `retail`).
  - Sanitize public trace response (no private user fields; include role + timestamps only).

  **Must NOT do**:
  - Patch/delete steps (append-only).
  - Allow steps for roles outside their permissions.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: backend data model + RBAC + timelines.
  - **Skills**: `convex-functions`, `convex-best-practices`
    - `convex-functions`: implement queries/mutations.
    - `convex-best-practices`: safe, indexed access patterns.
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: UI not relevant.

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: Tasks 7, 8
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `packages/backend/convex/schema.ts` — tables and indexes.
  - `packages/backend/convex/private-data.ts` — auth check pattern.
  - `packages/backend/convex/health-check.ts` — query structure baseline.
  - Convex query docs: https://docs.convex.dev/database/reading-data

  **Acceptance Criteria**:
  - [ ] `lots.create` returns `lotId` + `lotNumber`.
  - [ ] `steps.add` appends and updates lot status.
  - [ ] `trace.getByLotNumber` returns lot + timeline sorted by timestamp.
  - [ ] Unauthorized step types are rejected.

  **Agent-Executed QA Scenarios**:

  Scenario: Create lot + add step + fetch trace
    Tool: Bash
    Preconditions: Convex dev running, admin identity available
    Steps:
      1. Run: `bunx convex run --identity '{"subject":"0xADMIN","issuer":"https://better-auth"}' api.lots.create --args '{"productName":"Ashwagandha","origin":"Kerala"}'`
      2. Capture returned `lotId`
      3. Run: `bunx convex run --identity '{"subject":"0xADMIN","issuer":"https://better-auth"}' api.steps.add --args '{"lotId":"<lotId>","type":"harvest","title":"Harvest complete"}'`
      4. Run: `bunx convex run api.trace.getByLotNumber --args '{"lotNumber":"<lotNumber>"}'`
      5. Assert: response contains 1 step with type `harvest`
    Expected Result: Trace timeline contains newly added step

  Scenario: Unauthorized role cannot add step
    Tool: Bash
    Preconditions: Existing lot
    Steps:
      1. Run: `bunx convex run --identity '{"subject":"0xRETAILER","issuer":"https://better-auth"}' api.steps.add --args '{"lotId":"<lotId>","type":"process","title":"Processing"}' 2>&1 | tee .sisyphus/evidence/task-3-unauthorized-step.txt`
      2. Assert: output contains "Unauthorized" or "role"
    Expected Result: Mutation rejected
    Evidence: `.sisyphus/evidence/task-3-unauthorized-step.txt`

  **Commit**: YES (group with Task 2)

- [x] 4. Replace Better-Auth email/password with SIWE (backend)

  **What to do**:
  - Update `packages/backend/convex/auth.ts`:
    - Remove `emailAndPassword` config.
    - Add `siwe()` plugin with domain + nonce + `verifyMessage` using viem.
    - Keep `convex()` plugin for JWT issuance.
  - Ensure `SITE_URL` and auth secrets are set in backend env.
  - Keep `auth.config.ts` using `getAuthConfigProvider()`.

  **Must NOT do**:
  - Leave email/password enabled.
  - Store role only in JWT without DB lookup.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: auth reconfiguration and crypto verification.
  - **Skills**: `better-auth-best-practices`
    - `better-auth-best-practices`: ensures SIWE plugin is correct.
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: UI not relevant.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 6, 10)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `packages/backend/convex/auth.ts` — current Better-Auth setup.
  - `packages/backend/convex/auth.config.ts` — Convex auth config provider.
  - `packages/backend/convex/http.ts` — auth routes registration.
  - Better-Auth SIWE docs: https://better-auth.com/docs/plugins/siwe
  - Viem verifyMessage docs: https://viem.sh/docs/utilities/verifyMessage

  **Acceptance Criteria**:
  - [ ] `auth.ts` uses SIWE plugin and no email/password config.
  - [ ] `POST /api/auth/siwe/nonce` responds with a nonce.
  - [ ] `GET /api/auth/session` returns 200 (user null when not signed in).

  **Agent-Executed QA Scenarios**:

  Scenario: SIWE nonce endpoint responds
    Tool: Bash
    Preconditions: Dev server running on http://localhost:3001
    Steps:
      1. Run: `curl -s -X POST http://localhost:3001/api/auth/siwe/nonce -H "Content-Type: application/json" | tee .sisyphus/evidence/task-4-nonce.json`
      2. Assert: response contains a non-empty nonce field
    Expected Result: Nonce returned
    Evidence: `.sisyphus/evidence/task-4-nonce.json`

  Scenario: Session endpoint returns unauthenticated state
    Tool: Bash
    Preconditions: Dev server running
    Steps:
      1. Run: `curl -s http://localhost:3001/api/auth/session | tee .sisyphus/evidence/task-4-session.json`
      2. Assert: response contains `user: null` or `session: null`
    Expected Result: Session endpoint reachable
    Evidence: `.sisyphus/evidence/task-4-session.json`

  **Commit**: YES (group with Task 5)

- [x] 5. Add wallet auth UI + wagmi providers (frontend)

  **What to do**:
  - Add deps in `apps/web`: `wagmi`, `viem`, `@tanstack/react-query`.
  - Update `apps/web/src/components/providers.tsx`:
    - Wrap with `QueryClientProvider` and `WagmiProvider`.
    - Configure chains (default: Sepolia).
  - Update `apps/web/src/lib/auth-client.ts` to include `siweClient()` plugin.
  - Replace email/password UI with wallet connect UI:
    - Create `WalletConnectButton` using wagmi hooks.
    - Show connected wallet + role in `UserMenu`.
  - Add `AuthBootstrap` client component to call `users.ensureUser` on sign-in.
  - Add `data-testid` attributes for QA (e.g., `connect-wallet`, `user-menu`).
  - Remove or retire `SignInForm` / `SignUpForm` usages from the dashboard UI.

  **Must NOT do**:
  - Keep email/password sign-in forms.
  - Use non-shadcn UI components.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI + auth interaction design.
  - **Skills**: `frontend-design`, `better-auth-best-practices`
    - `frontend-design`: shadcn UI alignment.
    - `better-auth-best-practices`: correct SIWE client flow.
  - **Skills Evaluated but Omitted**:
    - `convex-functions`: backend already handled.

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 4)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Task 4

  **References**:
  - `apps/web/src/components/providers.tsx` — provider composition.
  - `apps/web/src/lib/auth-client.ts` — auth client setup.
  - `apps/web/src/app/dashboard/page.tsx` — authenticated/unauthenticated patterns.
  - `apps/web/src/components/sign-in-form.tsx` — to be removed/replaced.
  - `apps/web/src/components/sign-up-form.tsx` — to be removed/replaced.
  - `apps/web/src/components/user-menu.tsx` — update display to wallet + role.
  - wagmi docs: https://wagmi.sh/react/getting-started

  **Acceptance Criteria**:
  - [ ] Wallet connect UI replaces email/password UI.
  - [ ] After sign-in, `users.ensureUser` creates a user record.
  - [ ] `UserMenu` displays wallet + role and supports sign-out.

  **Agent-Executed QA Scenarios**:

  Scenario: Wallet connect button renders
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on http://localhost:3001
    Steps:
      1. Navigate to: http://localhost:3001/dashboard
      2. Wait for: `[data-testid="connect-wallet"]` visible (timeout: 5s)
      3. Screenshot: `.sisyphus/evidence/task-5-wallet-button.png`
    Expected Result: Connect wallet button is visible
    Evidence: `.sisyphus/evidence/task-5-wallet-button.png`

  Scenario: Sign-out clears session
    Tool: Playwright (playwright skill)
    Preconditions: Wallet already connected and user menu visible
    Steps:
      1. Click: `[data-testid="user-menu"]`
      2. Click: `[data-testid="sign-out"]`
      3. Wait for: `[data-testid="connect-wallet"]` visible (timeout: 5s)
      4. Screenshot: `.sisyphus/evidence/task-5-signout.png`
    Expected Result: User returns to unauthenticated state
    Evidence: `.sisyphus/evidence/task-5-signout.png`

  **Commit**: YES (group with Task 4)

- [x] 6. Implement route groups + layouts (public/app/admin)

  **What to do**:
  - Create route groups: `src/app/(public)`, `(app)`, `(admin)`.
  - Move existing home page to `(public)/page.tsx`.
  - Add `(public)/layout.tsx` with header + trace search.
  - Add `(app)/layout.tsx` with shadcn sidebar and auth guard.
  - Add `(admin)/layout.tsx` with admin role guard.
  - Update navigation in `Header` to link to new routes.

  **Must NOT do**:
  - Use non-shadcn components.
  - Leave admin routes unprotected.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: layout structure + navigation design.
  - **Skills**: `frontend-design`
  - **Skills Evaluated but Omitted**:
    - `convex-functions`: backend not involved.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4, 10)
  - **Blocks**: Tasks 7, 8, 9
  - **Blocked By**: None

  **References**:
  - `apps/web/src/app/layout.tsx` — root layout + Providers.
  - `apps/web/src/components/header.tsx` — navigation pattern.
  - `apps/web/src/app/page.tsx` — existing landing content.
  - Shadcn config: `apps/web/components.json`

  **Acceptance Criteria**:
  - [ ] Route groups exist and render without errors.
  - [ ] Unauthenticated users cannot access `(app)` or `(admin)` pages.
  - [ ] Admin route guard blocks non-admins.

  **Agent-Executed QA Scenarios**:

  Scenario: Public layout renders
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3001/
      2. Wait for: `[data-testid="public-layout"]` visible (timeout: 5s)
      3. Screenshot: `.sisyphus/evidence/task-6-public-layout.png`
    Expected Result: Public layout renders
    Evidence: `.sisyphus/evidence/task-6-public-layout.png`

  Scenario: Admin route blocked for unauthenticated user
    Tool: Playwright (playwright skill)
    Preconditions: No active session
    Steps:
      1. Navigate to: http://localhost:3001/admin
      2. Wait for: `[data-testid="access-denied"]` visible (timeout: 5s)
      3. Screenshot: `.sisyphus/evidence/task-6-admin-denied.png`
    Expected Result: Access denied message shown
    Evidence: `.sisyphus/evidence/task-6-admin-denied.png`

  **Commit**: YES (group with Task 7/8/9)

- [x] 7. Build public trace page + QR scan/manual entry

  **What to do**:
  - Add `TraceSearch` component on landing page (manual lot entry + scan button).
  - Integrate QR scanner (`@yudiel/react-qr-scanner`).
  - Build `(public)/trace/[lotNumber]/page.tsx` rendering lot summary + timeline.
  - Add empty-state for unknown lot number.
  - Use shadcn cards, badges, and timeline styling.
  - Add `data-testid` attributes for QA (`trace-input`, `trace-submit`, `trace-empty`).

  **Must NOT do**:
  - Require authentication for public trace.
  - Use non-shadcn UI components.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`
  - **Skills Evaluated but Omitted**:
    - `convex-functions`: backend already built.

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 3)
  - **Parallel Group**: Wave 4 (with Tasks 8, 9)
  - **Blocks**: —
  - **Blocked By**: Tasks 3, 6

  **References**:
  - `apps/web/src/app/page.tsx` — landing page structure.
  - `apps/web/src/index.css` — theme tokens for styling.
  - QR scanner docs: https://github.com/yudielcurbelo/react-qr-scanner

  **Acceptance Criteria**:
  - [ ] Manual lot entry navigates to `/trace/[lotNumber]`.
  - [ ] Trace page shows lot info + steps timeline.
  - [ ] Unknown lot shows friendly empty state.

  **Agent-Executed QA Scenarios**:

  Scenario: Manual search navigates to trace page
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running, lot exists in backend
    Steps:
      1. Navigate to: http://localhost:3001/
      2. Fill: `[data-testid="trace-input"]` → "LOT-TEST-001"
      3. Click: `[data-testid="trace-submit"]`
      4. Wait for: URL contains `/trace/LOT-TEST-001`
      5. Screenshot: `.sisyphus/evidence/task-7-trace-success.png`
    Expected Result: Trace page renders
    Evidence: `.sisyphus/evidence/task-7-trace-success.png`

  Scenario: Unknown lot shows empty state
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3001/trace/UNKNOWN-LOT
      2. Wait for: `[data-testid="trace-empty"]` visible (timeout: 5s)
      3. Screenshot: `.sisyphus/evidence/task-7-trace-empty.png`
    Expected Result: Empty state displayed
    Evidence: `.sisyphus/evidence/task-7-trace-empty.png`

  **Commit**: YES (group with Task 8)

- [x] 8. Implement authenticated traceability flows (lots + steps + QR)

  **What to do**:
  - Build `(app)/lots/page.tsx` with a table list of lots.
  - Build `(app)/lots/new/page.tsx` with create-lot form.
  - Build `(app)/lots/[id]/page.tsx` for lot detail + timeline + add-step form.
  - Show QR code for lot using `qrcode.react`.
  - Restrict step types by role in the UI (align with backend rules).
  - Update dashboard to show role-specific quick actions.
  - Add `data-testid` attributes for QA (e.g., `product-name`, `create-lot`, `timeline`).

  **Must NOT do**:
  - Allow unauthorized step types in UI.
  - Use non-shadcn components.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`
  - **Skills Evaluated but Omitted**:
    - `convex-functions`: backend already built.

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 3)
  - **Parallel Group**: Wave 4 (with Tasks 7, 9)
  - **Blocks**: —
  - **Blocked By**: Tasks 3, 5, 6

  **References**:
  - `apps/web/src/app/dashboard/page.tsx` — authenticated/unauthenticated pattern.
  - `apps/web/src/components/providers.tsx` — Convex provider usage.
  - `apps/web/src/lib/auth-client.ts` — auth client for sign-out.

  **Acceptance Criteria**:
  - [ ] Authenticated user can create a lot and see it in list.
  - [ ] QR code renders for each lot.
  - [ ] Step addition updates timeline and status.
  - [ ] Unauthorized step types are blocked in UI.

  **Agent-Executed QA Scenarios**:

  Scenario: Create lot and see it listed
    Tool: Playwright (playwright skill)
    Preconditions: Wallet session active
    Steps:
      1. Navigate to: http://localhost:3001/lots/new
      2. Fill: `[data-testid="product-name"]` → "Ashwagandha"
      3. Fill: `[data-testid="product-origin"]` → "Kerala"
      4. Click: `[data-testid="create-lot"]`
      5. Wait for: `[data-testid="lot-list"]` contains "Ashwagandha"
      6. Screenshot: `.sisyphus/evidence/task-8-lot-created.png`
    Expected Result: Lot created and visible in list
    Evidence: `.sisyphus/evidence/task-8-lot-created.png`

  Scenario: Add step and see timeline update
    Tool: Playwright (playwright skill)
    Preconditions: Existing lot and authenticated user with role
    Steps:
      1. Navigate to: http://localhost:3001/lots/<lotId>
      2. Select: `[data-testid="step-type"]` → "harvest"
      3. Fill: `[data-testid="step-title"]` → "Harvest complete"
      4. Click: `[data-testid="add-step"]`
      5. Wait for: `[data-testid="timeline"]` contains "Harvest complete"
      6. Screenshot: `.sisyphus/evidence/task-8-step-added.png`
    Expected Result: Timeline shows new step
    Evidence: `.sisyphus/evidence/task-8-step-added.png`

  **Commit**: YES (group with Task 7)

- [x] 9. Admin user management UI (role assignment)

  **What to do**:
  - Build `(admin)/page.tsx` for user list + role edit.
  - Display wallet address, role, createdAt.
  - Use shadcn select dropdown to update roles.
  - Enforce admin-only access in UI and backend.
  - Add `data-testid` attributes for QA (e.g., `role-select-<userId>`, `role-value-<userId>`).

  **Must NOT do**:
  - Allow role editing from non-admins.
  - Expose private data in admin list.

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `frontend-design`
  - **Skills Evaluated but Omitted**:
    - `convex-functions`: backend already built.

  **Parallelization**:
  - **Can Run In Parallel**: YES (after Task 2)
  - **Parallel Group**: Wave 4 (with Tasks 7, 8)
  - **Blocks**: —
  - **Blocked By**: Tasks 2, 5, 6

  **References**:
  - `apps/web/src/app/dashboard/page.tsx` — auth gating pattern.
  - `packages/backend/convex/users.ts` — admin list + setRole mutations.

  **Acceptance Criteria**:
  - [ ] Admin can view user list and change roles.
  - [ ] Non-admin sees access denied.
  - [ ] Role updates reflect immediately on next query.

  **Agent-Executed QA Scenarios**:

  Scenario: Admin updates user role
    Tool: Playwright (playwright skill)
    Preconditions: Admin session active, user exists
    Steps:
      1. Navigate to: http://localhost:3001/admin
      2. Click: `[data-testid="role-select-<userId>"]`
      3. Select option: "processor"
      4. Wait for: `[data-testid="role-value-<userId>"]` contains "processor"
      5. Screenshot: `.sisyphus/evidence/task-9-role-updated.png`
    Expected Result: Role updated and visible
    Evidence: `.sisyphus/evidence/task-9-role-updated.png`

  Scenario: Non-admin access denied
    Tool: Playwright (playwright skill)
    Preconditions: Non-admin session active
    Steps:
      1. Navigate to: http://localhost:3001/admin
      2. Wait for: `[data-testid="access-denied"]` visible (timeout: 5s)
      3. Screenshot: `.sisyphus/evidence/task-9-admin-denied.png`
    Expected Result: Access denied message
    Evidence: `.sisyphus/evidence/task-9-admin-denied.png`

  **Commit**: YES (group with Task 7/8)

- [x] 10. Phase 5 on-chain anchoring documentation

  **What to do**:
  - Create `docs/phase-5-onchain-anchoring.md` (create `docs/` if missing).
  - Explain hash calculation, tx anchoring, data stored in Convex.
  - Include verification flow and rationale (tamper-evidence, cost).
  - Outline future smart contract strategy (without implementing).

  **Must NOT do**:
  - Add on-chain code or smart contracts.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: documentation only.
  - **Skills**: none
  - **Skills Evaluated but Omitted**:
    - `frontend-design`: not needed for docs.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4, 6)
  - **Blocks**: —
  - **Blocked By**: None

  **References**:
  - Better-Auth docs: https://better-auth.com
  - Convex docs: https://docs.convex.dev
  - Ethereum tx basics: https://ethereum.org/en/developers/docs/transactions/

  **Acceptance Criteria**:
  - [ ] `docs/phase-5-onchain-anchoring.md` exists.
  - [ ] Document includes sections: Overview, Data Hashing, Anchoring Flow, Verification, Security, Future Enhancements.

  **Agent-Executed QA Scenarios**:

  Scenario: Doc file exists and includes required sections
    Tool: Bash
    Preconditions: File created
    Steps:
      1. Run: `node -e "const fs=require('fs');const c=fs.readFileSync('docs/phase-5-onchain-anchoring.md','utf8');['Overview','Data Hashing','Anchoring Flow','Verification','Security','Future Enhancements'].forEach(h=>{if(!c.includes(h)) process.exit(1);});"`
      2. Assert: exit code is 0
    Expected Result: Document contains all required sections

  **Commit**: YES

---

## Commit Strategy

| After Task(s) | Message | Files | Verification |
|--------------|---------|-------|--------------|
| 1–3 | `feat(convex): add traceability schema and functions` | `packages/backend/convex/*` | `bunx convex dev --once` |
| 4–5 | `feat(auth): add wallet-only siwe auth` | `packages/backend/convex/auth.ts`, `apps/web/src/lib/auth-client.ts` | `curl /api/auth/siwe/nonce` |
| 6–9 | `feat(ui): add route groups and traceability flows` | `apps/web/src/app/**/*` | Playwright QA scenarios |
| 10 | `docs: add on-chain anchoring plan` | `docs/phase-5-onchain-anchoring.md` | node file check |

---

## Success Criteria

### Verification Commands
```bash
bunx convex dev --once
bun run dev
```

### Final Checklist
- [x] Wallet-only SIWE sign-in works in dev
- [x] Roles enforced in Convex mutations/queries
- [x] Lots and steps flow works end-to-end
- [x] Public trace page resolves by lot number
- [x] Admin role updates apply immediately
- [x] Phase 5 documentation complete
