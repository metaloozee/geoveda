import { z } from "zod";
import { ETH_ADDRESS_REGEX } from "./constants";

const backendEnvSchema = z.object({
  BASE_SEPOLIA_RPC_URL: z.url().optional(),
  ANCHOR_REGISTRY_CONTRACT_ADDRESS: z
    .string()
    .regex(ETH_ADDRESS_REGEX)
    .optional(),
});

export const env = backendEnvSchema.parse({
  BASE_SEPOLIA_RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || undefined,
  ANCHOR_REGISTRY_CONTRACT_ADDRESS:
    process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS || undefined,
});
