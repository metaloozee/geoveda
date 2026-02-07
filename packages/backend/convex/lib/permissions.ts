import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

type UserRole = Doc<"users">["role"];

interface BetterAuthUser {
  _id: string;
  name: string;
  email: string;
  accounts?: Array<{ providerId: string; accountId: string }>;
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

function extractWalletAddress(authUser: BetterAuthUser): string | null {
  const siweAccount = authUser.accounts?.find(
    (acc) => acc.providerId === "siwe"
  );
  return siweAccount?.accountId ?? null;
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
  const authUser = await requireAuth(ctx);

  const walletAddress = extractWalletAddress(authUser);
  if (!walletAddress) {
    throw new ConvexError({
      code: "INVALID_AUTH",
      message: "Wallet address not found in auth session",
    });
  }

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

  const walletAddress = extractWalletAddress(authUser);
  if (!walletAddress) {
    return null;
  }

  return await getAppUser(ctx, walletAddress);
}

export async function requireAuthWithWallet(
  ctx: QueryCtx | MutationCtx
): Promise<{ authUser: BetterAuthUser; walletAddress: string }> {
  const authUser = await requireAuth(ctx);
  const walletAddress = extractWalletAddress(authUser);

  if (!walletAddress) {
    throw new ConvexError({
      code: "INVALID_AUTH",
      message: "Wallet address not found in auth session",
    });
  }

  return { authUser, walletAddress };
}
