"use client";

import { format } from "date-fns";
import { Package } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  complete: "default",
  in_progress: "secondary",
  created: "outline",
};

interface LotItem {
  _id: string;
  lotNumber: string;
  productName: string;
  origin: string;
  status: string;
  createdAt: number;
}

interface LotsTableProps {
  lots: LotItem[];
  emptyState: "all" | "filtered";
  canCreateLot?: boolean;
  onCreateLot?: () => void;
}

function getEmptyMessage(isFiltered: boolean, canCreateLot: boolean): string {
  if (isFiltered) {
    return "Try adjusting your search.";
  }
  if (canCreateLot) {
    return "Create your first lot to get started.";
  }
  return "Contact an admin or farmer to create lots.";
}

export function LotsTable({
  lots,
  emptyState,
  canCreateLot = false,
  onCreateLot,
}: LotsTableProps) {
  if (lots.length === 0) {
    const isFiltered = emptyState === "filtered";

    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium text-sm">No lots found</p>
          <p className="text-muted-foreground text-sm">
            {getEmptyMessage(isFiltered, canCreateLot)}
          </p>
        </div>
        {!isFiltered &&
          canCreateLot &&
          (onCreateLot ? (
            <Button onClick={onCreateLot} size="sm" variant="outline">
              Create Lot
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href={"/lots" as never}>Go to Lots</Link>
            </Button>
          ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lot Number</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="hidden sm:table-cell">Origin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot) => (
            <TableRow key={lot._id}>
              <TableCell className="font-mono text-sm">
                {lot.lotNumber}
              </TableCell>
              <TableCell className="font-medium">{lot.productName}</TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {lot.origin}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[lot.status] ?? "outline"}>
                  {lot.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {format(lot.createdAt, "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/lots/${lot._id}` as never}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
