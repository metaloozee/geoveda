import { env } from "@geoveda/env/web";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
});
