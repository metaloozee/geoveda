"use client";

import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { Loader2, Users } from "lucide-react";
import { getAdminUserColumns } from "@/components/admin-user-table-columns";
import { DataTable } from "@/components/ui/data-table";

interface AdminUserTableProps {
  users: Doc<"users">[] | undefined;
  isPending: boolean;
  onRoleChange: (userId: Id<"users">, newRole: string) => Promise<void>;
}

export function AdminUserTable({
  users,
  isPending,
  onRoleChange,
}: AdminUserTableProps) {
  if (isPending) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const columns = getAdminUserColumns({ onRoleChange });

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No users found.</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      searchPlaceholder="Search by username, wallet, or role..."
    />
  );
}
