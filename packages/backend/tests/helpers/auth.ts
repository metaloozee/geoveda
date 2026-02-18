import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { BackendTest } from "../harness";

type UserRole =
  | "farmer"
  | "processor"
  | "distributor"
  | "retailer"
  | "admin"
  | "unassigned";

const makeIdentity = (walletAddress: string) => ({
  walletAddress,
  subject: walletAddress,
  tokenIdentifier: walletAddress,
  name: walletAddress,
  email: `${walletAddress}@test.local`,
  emailVerified: true,
});

export const asWallet = (t: BackendTest, walletAddress: string) =>
  t.withIdentity(makeIdentity(walletAddress));

export const ensureUser = async (
  t: BackendTest,
  walletAddress: string,
  name: string
) => {
  return await asWallet(t, walletAddress).mutation(api.users.ensureUser, {
    name,
  });
};

export const ensureUserWithRole = async (
  t: BackendTest,
  options: {
    adminWallet: string;
    walletAddress: string;
    role: UserRole;
    name: string;
  }
): Promise<Id<"users">> => {
  const userId = await ensureUser(t, options.walletAddress, options.name);
  if (options.role !== "unassigned") {
    await asWallet(t, options.adminWallet).mutation(api.users.setRole, {
      role: options.role,
      userId,
    });
  }
  return userId;
};
