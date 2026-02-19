import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import { ETH_ADDRESS_REGEX } from "./constants";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_CONVEX_URL: z.url(),
    NEXT_PUBLIC_CONVEX_SITE_URL: z.url(),
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL: z.url().optional(),
    NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID: z.coerce.number().default(84_532),
    NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL: z
      .url()
      .default("https://sepolia.basescan.org"),
    NEXT_PUBLIC_ANCHOR_REGISTRY_CONTRACT_ADDRESS: z
      .string()
      .regex(ETH_ADDRESS_REGEX)
      .optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL,
    NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID,
    NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL:
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL,
    NEXT_PUBLIC_ANCHOR_REGISTRY_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_ANCHOR_REGISTRY_CONTRACT_ADDRESS,
  },
  emptyStringAsUndefined: true,
});
