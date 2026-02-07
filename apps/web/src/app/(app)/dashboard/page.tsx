"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Loader2, Package, PlusCircle, User } from "lucide-react";
import Link from "next/link";

import { AuthBootstrap } from "@/components/auth-bootstrap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserMenu from "@/components/user-menu";
import { WalletConnectButton } from "@/components/wallet-connect-button";

export default function DashboardPage() {
  // Cast api to any to avoid type errors when codegen hasn't run fully
  const safeApi = api as any;
  const user = useQuery(safeApi.users.getCurrent);

  return (
    <>
      <AuthBootstrap />
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-4">
        <Authenticated>
          <div className="flex w-full max-w-4xl flex-col items-center gap-8">
            <div className="space-y-2 text-center">
              <h1 className="font-bold text-3xl tracking-tight">
                Supply Chain Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your product lots and track their journey.
              </p>
            </div>

            <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
              <Link className="block h-full" href="/lots/new">
                <Card className="flex h-full cursor-pointer flex-col border-primary/20 transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-primary" />
                      Register New Lot
                    </CardTitle>
                    <CardDescription>
                      Create a new product batch and generate a tracking QR
                      code.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button className="w-full">Create Lot</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link className="block h-full" href="/lots">
                <Card className="flex h-full cursor-pointer flex-col border-primary/20 transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      View Inventory
                    </CardTitle>
                    <CardDescription>
                      Browse all tracked lots, view details, and update status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button className="w-full" variant="outline">
                      View All Lots
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">
                  Signed in as{" "}
                  <span className="text-primary capitalize">
                    {user?.role || "User"}
                  </span>
                </span>
              </div>
              <UserMenu />
            </div>
          </div>
        </Authenticated>
        <Unauthenticated>
          <div className="flex max-w-md flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl tracking-tight">
                Welcome to Geoveda
              </h1>
              <p className="text-muted-foreground">
                Blockchain-enabled supply chain traceability platform. Connect
                your wallet to get started.
              </p>
            </div>
            <WalletConnectButton />
          </div>
        </Unauthenticated>
        <AuthLoading>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Loading authentication...
            </p>
          </div>
        </AuthLoading>
      </div>
    </>
  );
}
