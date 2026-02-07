"use client";

import { Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createSiweMessage } from "viem/siwe";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function WalletConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const session = authClient.useSession();

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleSignIn = async () => {
    if (!(address && chainId)) {
      return;
    }

    try {
      setIsSigningIn(true);

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
        statement: "Sign in to Geoveda",
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

      window.location.href = "/dashboard";

      toast.success("Signed in with Ethereum");
    } catch {
      toast.error("Failed to sign in");
    } finally {
      setIsSigningIn(false);
    }
  };

  // If connected but not signed in
  if (isConnected && !session.data) {
    return (
      <div className="flex gap-2">
        <Button
          data-testid="siwe-button"
          disabled={isSigningIn}
          onClick={handleSignIn}
          variant="default"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Sign In with Ethereum
            </>
          )}
        </Button>
        <Button onClick={() => disconnect()} variant="ghost">
          Disconnect
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="mr-2 h-4 w-4" />
        )}
        Connect Wallet
      </Button>
    );
  }

  return null;
}
