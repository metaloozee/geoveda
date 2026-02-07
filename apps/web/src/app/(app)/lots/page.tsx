"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { Authenticated, useQuery } from "convex/react";
import { format } from "date-fns";
import { Package, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LotsPage() {
  const lots = useQuery(api.lots.list);

  return (
    <div className="container mx-auto space-y-8 py-8">
      <Authenticated>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Lots Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track and manage product lots across the supply chain.
            </p>
          </div>
          <Link href="/lots/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Lot
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Lots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center py-4">
              <Input className="max-w-sm" placeholder="Filter lots..." />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot Number</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots === undefined ? (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={6}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : lots.length === 0 ? (
                    <TableRow>
                      <TableCell className="h-24 text-center" colSpan={6}>
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Package className="h-8 w-8" />
                          <p>
                            No lots found. Create your first lot to get started.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    lots.map((lot) => (
                      <TableRow key={lot._id}>
                        <TableCell className="font-mono">
                          {lot.lotNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lot.productName}
                        </TableCell>
                        <TableCell>{lot.origin}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                              lot.status === "complete"
                                ? "bg-green-100 text-green-800"
                                : lot.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {lot.status.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(lot.createdAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/lots/${lot._id}`}>
                            <Button size="sm" variant="ghost">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Authenticated>
    </div>
  );
}
