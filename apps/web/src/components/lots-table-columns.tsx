"use client";

import type { Doc } from "@geoveda/backend/convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LotTableItem = Pick<
  Doc<"lots">,
  "_id" | "lotNumber" | "productName" | "origin" | "status" | "createdAt"
>;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  complete: "default",
  in_progress: "secondary",
  created: "outline",
};

const formatStatus = (status: string) =>
  status
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

export const lotColumns: ColumnDef<LotTableItem>[] = [
  {
    accessorKey: "lotNumber",
    header: "Lot",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="font-mono text-xs sm:text-sm">
        {row.original.lotNumber}
      </div>
    ),
  },
  {
    accessorKey: "productName",
    header: "Product",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <div className="max-w-44 truncate font-medium sm:max-w-none">
        {row.original.productName}
      </div>
    ),
  },
  {
    accessorKey: "origin",
    header: "Origin",
    enableGlobalFilter: true,
    meta: { className: "hidden md:table-cell text-muted-foreground" },
    cell: ({ row }) => row.original.origin,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableGlobalFilter: true,
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
        {formatStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    enableGlobalFilter: false,
    meta: { className: "hidden lg:table-cell text-muted-foreground" },
    cell: ({ row }) => format(row.original.createdAt, "MMM d, yyyy"),
  },
  {
    id: "actions",
    header: "",
    enableGlobalFilter: false,
    meta: { className: "text-right" },
    cell: ({ row }) => (
      <Button asChild size="sm" variant="ghost">
        <Link href={`/lots/${row.original._id}` as never}>View</Link>
      </Button>
    ),
  },
];
