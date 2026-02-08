"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldOff } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isPending } = useQuery(
    convexQuery(api.users.getCurrent, {})
  );

  if (isPending || user === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user === null || user.role !== "admin") {
    return (
      <div
        className="flex h-[50vh] flex-col items-center justify-center gap-3"
        data-testid="access-denied"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-semibold">Access Denied</p>
          <p className="text-muted-foreground text-sm">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
