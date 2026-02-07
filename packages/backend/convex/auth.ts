import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { generateRandomString } from "better-auth/crypto";
import { siwe } from "better-auth/plugins";
import { verifyMessage } from "viem";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";
const siteDomain = new URL(siteUrl).hostname;

export const authComponent = createClient<DataModel>(components.betterAuth);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    plugins: [
      siwe({
        domain: siteDomain,
        anonymous: true,
        getNonce: () =>
          Promise.resolve(generateRandomString(32, "a-z", "A-Z", "0-9")),
        verifyMessage: async ({ message, signature, address }) => {
          try {
            const isValid = await verifyMessage({
              address: address as `0x${string}`,
              message,
              signature: signature as `0x${string}`,
            });
            return isValid;
          } catch (error) {
            console.error("SIWE verification failed:", error);
            return false;
          }
        },
      }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
