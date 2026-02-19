export const BASE_SEPOLIA_CHAIN_ID = 84_532;
export const ANCHOR_EVENT_NAME = "Anchored";

import { ETH_ADDRESS_REGEX } from "@geoveda/env/constants";

function isHexAddress(value: string): value is `0x${string}` {
  return ETH_ADDRESS_REGEX.test(value);
}

const configuredAddress = process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS ?? "";

export const ANCHOR_REGISTRY_CONTRACT_ADDRESS: `0x${string}` | "" =
  isHexAddress(configuredAddress) ? configuredAddress : "";
