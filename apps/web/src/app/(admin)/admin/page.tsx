"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { Loader2, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function AdminPage() {
  const users = useQuery(api.users.list);
  const setRole = useMutation(api.users.setRole);

  const handleRoleChange = async (userId: Id<"users">, newRole: string) => {
    try {
      await setRole({ userId, role: newRole as UserRole });
      toast.success("Role updated successfully");
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (users === undefined) {
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
            Manage roles and permissions for {users.length} user
            {users.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No users found.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Change Role
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-mono text-sm">
                        {maskAddress(user.walletAddress)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={ROLE_COLORS[user.role] ?? ""}
                          variant="secondary"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) =>
                            value && handleRoleChange(user._id, value)
                          }
                        >
                          <SelectTrigger
                            className="w-[160px]"
                            data-testid={`role-select-${user._id}`}
                          >
                            <SelectValue
                              data-testid={`role-value-${user._id}`}
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
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {format(user.createdAt, "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
