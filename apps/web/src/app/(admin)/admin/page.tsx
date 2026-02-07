"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import type { Doc, Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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

function maskAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function AdminPage() {
  const users = useQuery(api.users.list);
  const setRole = useMutation(api.users.setRole);

  const handleRoleChange = async (userId: Id<"users">, newRole: string) => {
    try {
      await setRole({ userId, role: newRole as UserRole });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  if (users === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roles = [
    "farmer",
    "processor",
    "distributor",
    "retailer",
    "admin",
    "unassigned",
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 font-bold text-3xl tracking-tight">
        User Management
      </h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-mono">
                  {maskAddress(user.walletAddress)}
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) =>
                      value && handleRoleChange(user._id, value)
                    }
                  >
                    <SelectTrigger
                      className="w-[180px]"
                      data-testid={`role-select-${user._id}`}
                    >
                      <SelectValue
                        data-testid={`role-value-${user._id}`}
                        placeholder="Select role"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
