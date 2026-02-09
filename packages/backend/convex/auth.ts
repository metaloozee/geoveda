import {
  convexAdapter,
  createClient,
  type GenericCtx,
} from "@convex-dev/better-auth";
import type { ComponentApi } from "@convex-dev/better-auth/_generated/component.js";
import { convex } from "@convex-dev/better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { siwe } from "better-auth/plugins";
import type { GenericActionCtx } from "convex/server";
import { verifyMessage } from "viem";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";
const siteDomain = new URL(siteUrl).hostname;

const createSchemaAdapter = () =>
  convexAdapter<DataModel, GenericActionCtx<DataModel>, typeof authSchema>(
    {} as GenericActionCtx<DataModel>,
    { adapter: {} as ComponentApi["adapter"] }
  );

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);

export const createAuthOptions = (
  ctx?: GenericCtx<DataModel>
): BetterAuthOptions => {
  const database = ctx ? authComponent.adapter(ctx) : createSchemaAdapter();

  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database,
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
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
