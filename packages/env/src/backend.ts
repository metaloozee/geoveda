import { z } from "zod";

const backendEnvSchema = z.object({
  BASE_SEPOLIA_RPC_URL: z.url().optional(),
  ANCHOR_REGISTRY_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
});

export const env = backendEnvSchema.parse({
  BASE_SEPOLIA_RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || undefined,
  ANCHOR_REGISTRY_CONTRACT_ADDRESS:
    process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS || undefined,
});
