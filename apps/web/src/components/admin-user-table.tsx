"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Shield, Users } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { getAdminUserColumns } from "@/components/admin-user-table-columns";
import { DataTable } from "@/components/ui/data-table";

type UserRole = Doc<"users">["role"];

export function AdminUserTable() {
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

  const columns = useMemo(
    () => getAdminUserColumns({ onRoleChange: handleRoleChange }),
    [handleRoleChange]
  );

  if (isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
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

      {!users || users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No users found.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search by username, wallet, or role..."
        />
      )}
    </div>
  );
}
