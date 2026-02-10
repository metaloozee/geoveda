"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { AdminUserTable } from "@/components/admin-user-table";
import { Button } from "@/components/ui/button";

type UserRole = Doc<"users">["role"];

export default function AdminPage() {
  const { data: users, isPending } = useQuery(convexQuery(api.users.list, {}));
  const setRoleMutationFn = useConvexMutation(api.users.setRole);
  const { mutateAsync: setRole } = useMutation({
    mutationFn: setRoleMutationFn,
  });

  const handleRoleChange = useCallback(
    async (userId: Id<"users">, newRole: string) => {
      try {
        await setRole({ userId, role: newRole as UserRole });
        toast.success("Role updated successfully");
      } catch {
        toast.error("Failed to update role");
      }
    },
    [setRole]
  );

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <Button
        asChild
        className="w-fit text-muted-foreground"
        size="sm"
        variant="ghost"
      >
        <Link href="/dashboard">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="flex items-start gap-3 sm:items-center">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage roles and permissions for {users?.length ?? 0} user
            {users?.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <AdminUserTable
        isPending={isPending}
        onRoleChange={handleRoleChange}
        users={users}
      />
    </div>
  );
}
