"use client";

import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { Loader2, Users } from "lucide-react";
import { getAdminUserColumns } from "@/components/admin-user-table-columns";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUserTableProps {
  users: Doc<"users">[] | undefined;
  isPending: boolean;
  onRoleChange: (userId: Id<"users">, newRole: string) => Promise<void>;
}

const ROLES: Doc<"users">["role"][] = [
  "farmer",
  "processor",
  "distributor",
  "retailer",
  "admin",
  "unassigned",
];

const maskAddress = (address: string): string =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

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
    <div className="space-y-4">
      <div className="grid gap-3 sm:hidden">
        {users.map((user) => (
          <div
            className="flex justify-between rounded-xl border bg-card p-4 shadow-sm"
            key={user._id}
          >
            <div className="space-y-1">
              <p className="font-mono text-muted-foreground text-xs">
                {maskAddress(user.walletAddress)}
              </p>
              <p className="font-medium text-sm">
                {user.name?.trim() ? user.name : "Not set"}
              </p>
            </div>
            <div className="flex flex-col items-end justify-end gap-2">
              <Select
                defaultValue={user.role}
                onValueChange={(value) =>
                  value && onRoleChange(user._id, value)
                }
              >
                <SelectTrigger data-testid={`role-select-mobile-${user._id}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <span className="capitalize">{role}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        className="hidden sm:block"
        columns={columns}
        data={users}
        searchPlaceholder="Search by username, wallet, or role..."
      />
    </div>
  );
}
