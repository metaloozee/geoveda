"use client";

import {
  type AuthClient,
  ConvexBetterAuthProvider,
} from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { env } from "@geoveda/env/web";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexReactClient } from "convex/react";
import { WagmiProvider } from "wagmi";

import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/wagmi";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

export default function Providers({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConvexBetterAuthProvider
            authClient={authClient as unknown as AuthClient}
            client={convex}
            initialToken={initialToken}
          >
            {children}
          </ConvexBetterAuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
