import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type UserRole = Doc<"users">["role"];

interface BetterAuthUser {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAnonymous?: boolean | null;
}

interface IdentityLike {
  subject?: string;
  tokenIdentifier?: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  walletAddress?: string;
}

const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/;

function normalizeWalletAddress(
  value: string | null | undefined
): string | null {
  if (!(value && typeof value === "string")) {
    return null;
  }

  const match = value.match(ETH_ADDRESS_PATTERN);
  if (!match) {
    return null;
  }

  return match[0].toLowerCase();
}

function isAllowIdentityWalletFallbackInTests(): boolean {
  return process.env.CONVEX_TEST_USE_IDENTITY_WALLET === "true";
}

function asIdentityLike(value: unknown): IdentityLike | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as IdentityLike;
}

function getWalletAddressFromIdentity(
  identity: IdentityLike | null
): string | null {
  const walletAddress = identity?.walletAddress;
  if (walletAddress && typeof walletAddress === "string") {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    if (normalizedWalletAddress) {
      return normalizedWalletAddress;
    }
    if (isAllowIdentityWalletFallbackInTests()) {
      return walletAddress.toLowerCase();
    }
  }

  if (!isAllowIdentityWalletFallbackInTests()) {
    return null;
  }

  const fallbackWalletAddress = identity?.tokenIdentifier ?? identity?.subject;
  if (!fallbackWalletAddress || typeof fallbackWalletAddress !== "string") {
    return null;
  }

  // Tests use lightweight wallet-like identifiers (e.g. "0xseedadmin")
  // that are not strict 40-hex Ethereum addresses.
  return (
    normalizeWalletAddress(fallbackWalletAddress) ??
    fallbackWalletAddress.toLowerCase()
  );
}

export async function getAuthUser(
  ctx: QueryCtx | MutationCtx,
  identity?: IdentityLike | null
): Promise<BetterAuthUser | null> {
  const resolvedIdentity =
    identity === undefined
      ? asIdentityLike(await ctx.auth.getUserIdentity())
      : identity;

  if (resolvedIdentity) {
    const userId = resolvedIdentity.subject ?? resolvedIdentity.tokenIdentifier;
    const { name, email, emailVerified } = resolvedIdentity;
    const hasRequiredIdentityFields =
      typeof userId === "string" &&
      typeof name === "string" &&
      typeof email === "string" &&
      typeof emailVerified === "boolean";

    if (hasRequiredIdentityFields) {
      return {
        _id: userId,
        name,
        email,
        emailVerified,
        isAnonymous: false,
      };
    }
  }

  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    return null;
  }
  return authUser as unknown as BetterAuthUser;
}

async function extractWalletAddress(
  ctx: QueryCtx | MutationCtx,
  authUserId: string,
  identity?: IdentityLike | null
): Promise<string | null> {
  const resolvedIdentity =
    identity === undefined
      ? asIdentityLike(await ctx.auth.getUserIdentity())
      : identity;
  const identityWalletAddress = getWalletAddressFromIdentity(resolvedIdentity);
  if (identityWalletAddress) {
    return identityWalletAddress;
  }

  const account = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "account",
    where: [
      { field: "userId", value: authUserId },
      { field: "providerId", value: "siwe" },
    ],
  });

  if (!account) {
    return null;
  }

  return normalizeWalletAddress((account as { accountId?: string }).accountId);
}

export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  identity?: IdentityLike | null
): Promise<BetterAuthUser> {
  const authUser = await getAuthUser(ctx, identity);
  if (!authUser) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Authentication required",
    });
  }
  return authUser;
}

export async function getAppUser(
  ctx: QueryCtx | MutationCtx,
  walletAddress: string
): Promise<Doc<"users"> | null> {
  const normalized =
    normalizeWalletAddress(walletAddress) ?? walletAddress.toLowerCase();
  const candidates = Array.from(
    new Set([
      walletAddress,
      walletAddress.toLowerCase(),
      normalized,
      `${normalized}:1`,
      `${normalized}:84532`,
      `eip155:1:${normalized}`,
      `eip155:84532:${normalized}`,
    ])
  );

  for (const candidate of candidates) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", candidate))
      .unique();
    if (user) {
      return user;
    }
  }

  return null;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: UserRole
): Promise<Doc<"users">> {
  const { walletAddress } = await requireAuthWithWallet(ctx);

  const appUser = await getAppUser(ctx, walletAddress);
  if (!appUser) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "User profile not found. Please complete registration.",
    });
  }

  if (appUser.role !== role) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Role '${role}' required. You have role '${appUser.role}'.`,
    });
  }

  return appUser;
}

export function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  return requireRole(ctx, "admin");
}

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = asIdentityLike(await ctx.auth.getUserIdentity());
  const authUser = await getAuthUser(ctx, identity);
  if (!authUser) {
    return null;
  }

  const walletAddress = await extractWalletAddress(ctx, authUser._id, identity);
  if (!walletAddress) {
    return null;
  }

  return await getAppUser(ctx, walletAddress);
}

export async function requireAuthWithWallet(
  ctx: QueryCtx | MutationCtx
): Promise<{ authUser: BetterAuthUser; walletAddress: string }> {
  const identity = asIdentityLike(await ctx.auth.getUserIdentity());
  const authUser = await requireAuth(ctx, identity);
  const walletAddress = await extractWalletAddress(ctx, authUser._id, identity);

  if (!walletAddress) {
    throw new ConvexError({
      code: "INVALID_AUTH",
      message: "Wallet address not found in auth session",
    });
  }

  return { authUser, walletAddress: walletAddress.toLowerCase() };
}
