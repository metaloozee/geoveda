"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.getCurrent);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  if (user === null || user.role !== "admin") {
    return (
      <div
        className="flex h-screen w-full items-center justify-center text-red-500"
        data-testid="access-denied"
      >
        Access Denied
      </div>
    );
  }

  return <>{children}</>;
}
