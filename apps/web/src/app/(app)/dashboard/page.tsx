"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Leaf, Loader2, Package, PlusCircle, Wallet } from "lucide-react";

import Link from "next/link";

import { AuthBootstrap } from "@/components/auth-bootstrap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WalletConnectButton } from "@/components/wallet-connect-button";

function AuthenticatedDashboard() {
  const user = useQuery(api.users.getCurrent);
  const lots = useQuery(api.lots.list);

  const totalLots = lots?.length ?? 0;
  const completeLots = lots?.filter((l) => l.status === "complete").length ?? 0;
  const inProgress =
    lots?.filter((l) => l.status === "in_progress").length ?? 0;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Welcome back
          {user?.role && user.role !== "unassigned" ? (
            <span>
              , <span className="capitalize">{user.role}</span>
            </span>
          ) : null}
          . Here&apos;s an overview of your supply chain.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Total Lots</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalLots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">In Progress</CardTitle>
            <Loader2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Completed</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{completeLots}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="block" href="/lots/new">
          <Card className="group h-full cursor-pointer transition-colors hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <PlusCircle className="h-4 w-4 text-primary" />
                </div>
                Register New Lot
              </CardTitle>
              <CardDescription>
                Create a new product batch and generate a tracking QR code.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link className="block" href="/lots">
          <Card className="group h-full cursor-pointer transition-colors hover:border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                View Inventory
              </CardTitle>
              <CardDescription>
                Browse tracked lots, view details, and update status.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <AuthBootstrap />
      <Authenticated>
        <AuthenticatedDashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="font-semibold text-2xl tracking-tight">
              Welcome to Geoveda
            </h1>
            <p className="mx-auto max-w-sm text-muted-foreground text-sm">
              Blockchain-backed supply chain traceability. Connect your wallet
              to manage product lots.
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
