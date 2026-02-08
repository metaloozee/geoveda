"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { WalletConnectButton } from "@/components/wallet-connect-button";

function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard" as never);
  }, [router]);

  return null;
}

export default function ConnectPage() {
  return (
    <>
      <AuthBootstrap />
      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-semibold text-2xl tracking-tight">
              Connect your wallet
            </h1>
            <p className="mx-auto max-w-sm text-muted-foreground text-sm">
              Sign in with your wallet to access the Geoveda dashboard and
              manage product lots.
            </p>
          </div>
          <WalletConnectButton />
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthLoading>
    </>
  );
}
