"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { Authenticated, useQuery } from "convex/react";
import { format } from "date-fns";
import { Loader2, Package, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

function LotsEmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1 text-center">
        <p className="font-medium text-sm">No lots found</p>
        <p className="text-muted-foreground text-sm">
          {hasFilter
            ? "Try adjusting your search."
            : "Create your first lot to get started."}
        </p>
      </div>
      {!hasFilter && (
        <Button asChild size="sm" variant="outline">
          <Link href={"/lots/new" as never}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Create Lot
          </Link>
        </Button>
      )}
    </div>
  );
}

function LotsTable({ lots }: { lots: LotItem[] }) {
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

function LotsContent() {
  const lots = useQuery(api.lots.list);
  const [filter, setFilter] = useState("");

  const filteredLots =
    lots?.filter(
      (lot) =>
        lot.productName.toLowerCase().includes(filter.toLowerCase()) ||
        lot.lotNumber.toLowerCase().includes(filter.toLowerCase()) ||
        lot.origin.toLowerCase().includes(filter.toLowerCase())
    ) ?? [];

  const renderContent = () => {
    if (lots === undefined) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    if (filteredLots.length === 0) {
      return <LotsEmptyState hasFilter={filter.length > 0} />;
    }

    return <LotsTable lots={filteredLots} />;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">All Lots</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Track and manage product lots across the supply chain.
          </p>
        </div>
        <Button asChild>
          <Link href={"/lots/new" as never}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Lot
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name, lot number, or origin…"
              value={filter}
            />
          </div>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LotsPage() {
  return (
    <Authenticated>
      <LotsContent />
    </Authenticated>
  );
}
