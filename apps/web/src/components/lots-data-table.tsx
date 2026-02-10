"use client";

import type { Doc } from "@geoveda/backend/convex/_generated/dataModel";
import { Loader2, Package } from "lucide-react";
import Link from "next/link";
import { lotColumns } from "@/components/lots-table-columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

interface LotsDataTableProps {
  lots: Doc<"lots">[] | undefined;
  isPending: boolean;
  onCreateLot?: () => void;
}

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

export function LotsDataTable({
  lots,
  isPending,
  onCreateLot,
}: LotsDataTableProps) {
  if (isPending) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!lots || lots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-14">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm">No lots yet</p>
          <p className="text-muted-foreground text-sm">
            Create your first lot to begin traceability tracking.
          </p>
        </div>
        {onCreateLot ? (
          <Button onClick={onCreateLot} size="sm" variant="outline">
            Create Lot
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={"/lots/new" as never}>Create Lot</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:hidden">
        {lots.map((lot) => (
          <div
            className="rounded-xl border bg-card p-4 shadow-sm"
            key={lot._id}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-mono text-muted-foreground text-xs">
                  {lot.lotNumber}
                </p>
                <p className="line-clamp-2 font-medium text-sm">
                  {lot.productName}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[lot.status] ?? "outline"}>
                {formatStatus(lot.status)}
              </Badge>
            </div>
            <p className="mb-3 text-muted-foreground text-xs">{lot.origin}</p>
            <Button asChild className="w-full" size="sm" variant="outline">
              <Link href={`/lots/${lot._id}` as never}>Open lot details</Link>
            </Button>
          </div>
        ))}
      </div>

      <DataTable
        className="hidden sm:block"
        columns={lotColumns}
        data={lots}
        emptyMessage="No lots matched your search."
        searchPlaceholder="Search lots by number, product, origin, or status..."
      />
    </div>
  );
}
