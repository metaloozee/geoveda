"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createSiweMessage } from "viem/siwe";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/;

function normalizeWalletAddress(value: string): string {
  const match = value.match(ETH_ADDRESS_PATTERN);
  if (!match) {
    return value.toLowerCase();
  }
  return match[0].toLowerCase();
}

export function WalletConnectButton() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const session = authClient.useSession();
  const { data: appUser } = useQuery(convexQuery(api.users.getCurrent, {}));
  const isOnBaseSepolia = chainId === baseSepolia.id;
  const isWalletSessionMismatch = useMemo(() => {
    if (!(session.data && appUser?.walletAddress && address)) {
      return false;
    }
    return (
      normalizeWalletAddress(appUser.walletAddress) !==
      normalizeWalletAddress(address)
    );
  }, [address, appUser?.walletAddress, session.data]);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleSignIn = async () => {
    if (!(address && chainId)) {
      return;
    }

    if (!isOnBaseSepolia) {
      toast.error("Switch to Base Sepolia before signing in.");
      return;
    }

    setIsSigningIn(true);
    try {
      // 1. Get nonce from Better Auth
      const nonceResponse = await authClient.siwe.nonce({
        walletAddress: address,
      });
      if (nonceResponse.error) {
        throw new Error(nonceResponse.error.message ?? "Failed to get nonce");
      }
      const { nonce } = nonceResponse.data;

      // 2. Create SIWE message
      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        uri: window.location.origin,
        version: "1",
        nonce,
        statement: "Sign in to GeoVeda (Base Sepolia)",
      });

      // 3. Sign message using Wagmi
      const signature = await signMessageAsync({ message });

      // 4. Verify signature with Better Auth
      const verifyResponse = await authClient.siwe.verify({
        message,
        signature,
        walletAddress: address,
      });
      if (verifyResponse.error) {
        throw new Error(verifyResponse.error.message ?? "Verification failed");
      }

      setIsSigningIn(false);
      toast.success("Signed in with Base Sepolia wallet");
      router.push("/dashboard");
    } catch {
      setIsSigningIn(false);
      toast.error("Failed to sign in");
    }
  };

  const handleSwitchToBaseSepolia = async () => {
    try {
      await switchChainAsync({ chainId: baseSepolia.id });
      toast.success("Switched to Base Sepolia");
    } catch {
      toast.error("Failed to switch network");
    }
  };

  // If connected but not signed in
  if (isConnected && !session.data) {
    return (
      <div className="flex gap-2">
        {!isOnBaseSepolia && (
          <Button
            data-testid="switch-base-sepolia"
            disabled={isSwitchingChain}
            onClick={handleSwitchToBaseSepolia}
            variant="secondary"
          >
            {isSwitchingChain ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              "Switch to Base Sepolia"
            )}
          </Button>
        )}
        <Button
          data-testid="siwe-button"
          disabled={isSigningIn || !isOnBaseSepolia}
          onClick={handleSignIn}
          variant="default"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Sign In with Base
            </>
          )}
        </Button>
        <Button onClick={() => disconnect()} variant="ghost">
          Disconnect
        </Button>
      </div>
    );
  }

  if (isConnected && session.data && isWalletSessionMismatch) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={async () => {
            await authClient.signOut();
            disconnect();
            router.refresh();
            toast.info("Session reset. Reconnect and sign in again.");
          }}
          variant="destructive"
        >
          Reset Session
        </Button>
      </div>
    );
  }

  // If not connected
  if (!isConnected) {
    return (
      <Button
        data-testid="connect-wallet"
        disabled={isConnecting}
        onClick={handleConnect}
        variant="outline"
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        Connect Wallet
      </Button>
    );
  }

  return null;
}
