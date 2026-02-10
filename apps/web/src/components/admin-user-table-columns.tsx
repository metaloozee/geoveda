"use client";

import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = Doc<"users">["role"];

const ROLES: UserRole[] = [
  "farmer",
  "processor",
  "distributor",
  "retailer",
  "admin",
  "unassigned",
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  farmer: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  processor:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  distributor:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  retailer:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  unassigned: "",
};

const maskAddress = (address: string): string =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

interface GetAdminUserColumnsProps {
  onRoleChange: (userId: Id<"users">, newRole: string) => Promise<void>;
}

export const getAdminUserColumns = ({
  onRoleChange,
}: GetAdminUserColumnsProps): ColumnDef<Doc<"users">>[] => [
  {
    accessorKey: "walletAddress",
    header: "Wallet Address",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {maskAddress(row.original.walletAddress)}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Username",
    enableGlobalFilter: true,
    cell: ({ row }) => row.original.name?.trim() || "Not set",
  },
  {
    accessorKey: "role",
    header: "Current Role",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <Badge
        className={ROLE_COLORS[row.original.role] ?? ""}
        variant="secondary"
      >
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "changeRole",
    header: "Change Role",
    enableGlobalFilter: false,
    meta: { className: "hidden sm:table-cell" },
    cell: ({ row }) => (
      <Select
        defaultValue={row.original.role}
        onValueChange={(value) =>
          value && onRoleChange(row.original._id, value)
        }
      >
        <SelectTrigger data-testid={`role-select-${row.original._id}`}>
          <SelectValue
            data-testid={`role-value-${row.original._id}`}
            placeholder="Select role"
          />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              <span className="capitalize">{role}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    enableGlobalFilter: false,
    meta: { className: "hidden md:table-cell text-muted-foreground" },
    cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy"),
  },
];
