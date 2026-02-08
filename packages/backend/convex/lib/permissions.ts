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

export async function getAuthUser(
  ctx: QueryCtx | MutationCtx
): Promise<BetterAuthUser | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) {
    return null;
  }
  return authUser as unknown as BetterAuthUser;
}

async function extractWalletAddress(
  ctx: QueryCtx | MutationCtx,
  authUserId: string
): Promise<string | null> {
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

  return (account as { accountId?: string }).accountId ?? null;
}

export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<BetterAuthUser> {
  const authUser = await getAuthUser(ctx);
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
  return await ctx.db
    .query("users")
    .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
    .unique();
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
  const authUser = await getAuthUser(ctx);
  if (!authUser) {
    return null;
  }

  const walletAddress = await extractWalletAddress(ctx, authUser._id);
  if (!walletAddress) {
    return null;
  }

  return await getAppUser(ctx, walletAddress);
}

export async function requireAuthWithWallet(
  ctx: QueryCtx | MutationCtx
): Promise<{ authUser: BetterAuthUser; walletAddress: string }> {
  const authUser = await requireAuth(ctx);
  const walletAddress = await extractWalletAddress(ctx, authUser._id);

  if (!walletAddress) {
    throw new ConvexError({
      code: "INVALID_AUTH",
      message: "Wallet address not found in auth session",
    });
  }

  return { authUser, walletAddress };
}
