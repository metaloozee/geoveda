"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Doc } from "@geoveda/backend/convex/_generated/dataModel";
import { useQuery } from "@tanstack/react-query";
import { Authenticated, AuthLoading } from "convex/react";
import { Leaf, Loader2, Package, PlusCircle, ShieldOff } from "lucide-react";
import Link from "next/link";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DASHBOARD_ROLES: Doc<"users">["role"][] = [
  "farmer",
  "processor",
  "distributor",
  "retailer",
  "admin",
];

function AccessDenied() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center"
      data-testid="dashboard-access-denied"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOff className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Access Pending</p>
        <p className="text-muted-foreground text-sm">
          Your account role hasn&apos;t been assigned yet. Please contact an
          administrator to gain dashboard access.
        </p>
      </div>
    </div>
  );
}

function AuthenticatedDashboard() {
  const { data: user, isPending: userPending } = useQuery(
    convexQuery(api.users.getCurrent, {})
  );
  const { data: lots, isPending: _lotsPending } = useQuery(
    convexQuery(api.lots.list, {})
  );

  const totalLots = lots?.length ?? 0;
  const completeLots = lots?.filter((l) => l.status === "complete").length ?? 0;
  const inProgress =
    lots?.filter((l) => l.status === "in_progress").length ?? 0;

  if (userPending || user === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const canAccessDashboard =
    user !== null && DASHBOARD_ROLES.includes(user.role ?? "unassigned");

  if (!canAccessDashboard) {
    return <AccessDenied />;
  }

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

export function DashboardContent() {
  return (
    <>
      <AuthBootstrap />
      <Authenticated>
        <AuthenticatedDashboard />
      </Authenticated>
      <AuthLoading>
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthLoading>
    </>
  );
}
