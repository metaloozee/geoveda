# Draft: Geoveda – Ayurvedic Product Traceability App

## Requirements (confirmed)

- **Core Product**: Traceability web app for Ayurvedic products — scan QR/lot code → view farm-to-consumer steps with blockchain anchoring
- **Tech Stack**: Next.js 16 + Convex + Better-Auth (existing monorepo scaffold from Better-T-Stack)
- **Auth Method**: Wallet-only authentication on Ethereum testnet (SIWE - Sign In With Ethereum)
- **On-chain Usage**: Verification only — anchor step hashes on-chain, store txHash in Convex for fast retrieval
- **Database Tables**: users (profile + RBAC), lots (traced units), steps (immutable events), anchors (on-chain proof links)
- **RBAC**: Roles stored in Convex users table (not only JWT) so admin role changes take effect immediately
- **Permissions**: Enforced server-side in Convex mutations/queries using authenticated identity from JWT + user record lookup
- **UI Framework**: shadcn components only (base-lyra style already configured)
- **Monorepo**: Turborepo with apps/web (Next.js) + packages/backend (Convex) + packages/config + packages/env

## Roadmap (user-specified phases)

### Phase 1: App Skeleton
- Route groups: `(public)`, `(app)` (authenticated + roles), `(admin)` (system admin roles)
- Empty screens wired to shared providers
- Use shadcn components, install missing ones via CLI in apps/web
- Load frontend-design skill

### Phase 2: Convex Setup
- Database tables (brief, MVP-focused)
- Convex functions (queries + mutations) — no anchors yet
- Auth checks in every mutation/query that needs auth
- Roles in users table for immediate effect
- Wire Next.js app and Convex properly (monorepo already partially configured)

### Phase 3: Wallet-only Authentication
- Better-Auth SIWE plugin integration
- Convex custom JWT provider configuration
- Only wallet holders can log in
- Convex recognizes them as authenticated

### Phase 4: Core Traceability Flows
- Role-gated end-to-end trace
- MVP understandable to consumer

### Phase 5: On-chain Anchoring (future scope)
- Generate comprehensive markdown explaining what it does and why
- Keep Convex for speed, chain only for proof

## Technical Decisions

### Existing Codebase State
- **Convex schema**: EMPTY (`defineSchema({})`) — no custom tables defined yet
- **Auth**: Email/password via Better-Auth currently configured — needs replacement with wallet-only
- **Better-Auth + Convex**: Already integrated via `@convex-dev/better-auth` package (v0.10.9)
- **Auth flow**: `authComponent` (createClient), `createAuth` function, `registerRoutes` on HTTP router
- **Protected queries**: Using `authComponent.safeGetAuthUser(ctx)` pattern
- **ConvexBetterAuthProvider**: Already wrapping app with initial token from server
- **shadcn**: base-lyra style, neutral baseColor, components in `src/components/ui/`
- **Installed shadcn components**: button, input, label, dropdown-menu, card, checkbox, skeleton, sonner
- **No middleware**: No Next.js middleware exists yet
- **No custom routes**: Only `/` (home) and `/dashboard` exist
- **Package manager**: Bun 1.3.8
- **Port**: 3001

### Auth Architecture (wallet-only)
- Replace email/password with SIWE (better-auth siwe plugin)
- Better-Auth issues JWTs via `convex()` plugin — Convex validates via JWKS endpoint
- auth.config.ts uses `getAuthConfigProvider()` — handles JWT validation automatically
- Custom claims in JWT (role, walletAddress) for performance
- Authoritative role check always from Convex DB users table (not JWT) for security-critical ops
- Token refresh handled by `ConvexBetterAuthProvider` automatically

### RBAC Pattern
- Helper functions: `requireUser()`, `requireRole()` wrapping `authComponent.safeGetAuthUser(ctx)`
- Roles stored in Convex users table — changes apply immediately on next query
- JWT may contain stale role — always do DB lookup for mutations
- Role types: farmer, processor, distributor, retailer, admin (user specified Ayurvedic supply chain)

### Database Design (MVP)
- **users**: walletAddress, name, role, createdAt
- **lots**: lotNumber, productName, origin, status, createdBy, createdAt
- **steps**: lotId, type, title, description, actor, actorRole (denormalized), timestamp — APPEND-ONLY
- **anchors**: stepId, lotId, txHash, dataHash, chainId, anchoredAt — FUTURE SCOPE

### Route Structure
- `(public)/` — Landing page, public trace page (`/trace/[lotId]`)
- `(app)/` — Authenticated dashboards (farmer, processor, distributor, retailer)
- `(admin)/` — Admin dashboard, user management

## Research Findings

### Better-Auth + Convex Integration
- `@convex-dev/better-auth` handles JWT issuance and JWKS rotation automatically
- `convex()` plugin in Better-Auth server config handles JWT creation compatible with Convex
- `convexClient()` plugin on client handles token sync
- `ConvexBetterAuthProvider` on React side handles auth state + initial token hydration
- SIWE plugin available in `better-auth/plugins` — needs `viem` for message verification
- Client needs `siweClient()` plugin + wagmi/viem for wallet interaction

### Convex RBAC Patterns
- Use `authComponent.safeGetAuthUser(ctx)` to get authenticated user
- Then look up user record in users table for authoritative role
- Create helper functions: `requireAuth`, `requireRole`, `requireLotAccess`
- Append-only steps: only `ctx.db.insert()`, never `patch`/`delete`
- Corrections via new "correction" step referencing original
- Compound indexes for efficient timeline queries: `by_lot_and_timestamp`

### shadcn Components Needed
- **Layout**: sidebar, breadcrumb, navigation-menu, sheet
- **Data**: table (data-table with TanStack), card, badge, tabs
- **Forms**: form (react-hook-form), input, textarea, select, date-picker
- **Feedback**: alert, progress, toast (sonner already installed), dialog
- **Navigation**: tabs, breadcrumb
- **QR**: qrcode.react (generation), @yudiel/react-qr-scanner (scanning)
- **Timeline**: Custom component (no official shadcn timeline)
- Install via: `bunx shadcn@latest add <component> --cwd apps/web`

## Interview Decisions (Final)

- **Test Strategy**: No automated tests — Agent-Executed QA (Playwright, curl) only
- **Wallet Library**: wagmi + viem (recommended) — WagmiProvider, useConnect, useSignMessage
- **Roles**: farmer, processor, distributor, retailer, admin — confirmed
- **QR Scanning**: Both camera-based QR scan + manual lot entry
- **On-chain**: Phase 5 is future scope, generate markdown only
- **Auth**: Wallet-only, no email/password fallback

## Scope Boundaries

### INCLUDE
- Route structure with 3 groups: (public), (app), (admin)
- Convex schema + functions for users, lots, steps
- Wallet-only auth via Better-Auth SIWE + Convex JWT
- Role-gated dashboards and traceability flows
- Public trace page for consumers
- QR code generation for lots
- shadcn-based UI throughout
- Phase 5 as markdown documentation only

### EXCLUDE
- Email/password authentication (remove existing)
- On-chain smart contract deployment or interaction code
- File uploads / document storage
- Multi-language / i18n
- Mobile native app
- Email notifications
- Analytics / reporting dashboards
- Payment processing
- Organization/multi-tenancy (MVP: flat user list with roles)
