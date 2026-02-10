"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Sprout,
  Store,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TracePageProps {
  params: { lotNumber: string };
}

interface TimelineStep {
  type: string;
  title: string;
  description?: string;
  actorRole: string;
  timestamp: number;
}

const STEP_ICONS: Record<string, typeof Sprout> = {
  harvest: Sprout,
  process: Factory,
  quality_check: ClipboardCheck,
  transport: Truck,
  receive: Package,
  retail: Store,
};

const STEP_COLORS: Record<string, string> = {
  harvest: "text-green-600 bg-green-50 dark:bg-green-950/40",
  process: "text-orange-600 bg-orange-50 dark:bg-orange-950/40",
  quality_check: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
  transport: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  receive: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
  retail: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40",
};

const formatStepType = (type: string) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function TracePage({ params }: TracePageProps) {
  const lotNumber = decodeURIComponent(params.lotNumber);
  const { data, isPending } = useQuery(
    convexQuery(api.trace.getByLotNumber, { lotNumber })
  );

  if (isPending) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (data == null) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <h1 className="font-semibold text-xl">Lot not found</h1>
          <p className="text-muted-foreground text-sm">
            No records for{" "}
            <span className="font-mono text-foreground">{lotNumber}</span>
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to search
          </Link>
        </Button>
        <div className="hidden" data-testid="trace-empty">
          Empty State Marker
        </div>
      </div>
    );
  }

  const { lot, timeline } = data;
  const typedTimeline = timeline as TimelineStep[];

  const statusVariant = lot.status === "complete" ? "default" : "secondary";

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <Button
        asChild
        className="text-muted-foreground"
        size="sm"
        variant="ghost"
      >
        <Link href="/">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{lot.productName}</CardTitle>
              <p className="font-mono text-muted-foreground text-sm">
                {lot.lotNumber}
              </p>
            </div>
            <Badge variant={statusVariant}>
              {lot.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Origin:</span>
            <span className="font-medium">{lot.origin}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Leaf className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {format(lot.createdAt, "MMM d, yyyy")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Journey Timeline</h2>
        <p className="text-muted-foreground text-sm">
          {typedTimeline.length} step{typedTimeline.length !== 1 ? "s" : ""}{" "}
          recorded
        </p>
      </div>

      {typedTimeline.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            No steps recorded yet.
          </p>
        </div>
      ) : (
        <div className="relative ml-4 space-y-0 border-muted-foreground/20 border-l pl-8">
          {typedTimeline.map((step, index) => {
            const Icon = STEP_ICONS[step.type] ?? CheckCircle2;
            const colorClass =
              STEP_COLORS[step.type] ?? "text-muted-foreground bg-muted";
            const isLast = index === typedTimeline.length - 1;

            return (
              <div
                className={`relative pb-8 ${isLast ? "pb-0" : ""}`}
                key={`${step.timestamp}-${index}`}
              >
                <span
                  className={`absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatStepType(step.type)}</Badge>
                    <time className="font-mono text-muted-foreground text-xs">
                      {format(step.timestamp, "MMM d, yyyy 'at' h:mm a")}
                    </time>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    By{" "}
                    <span className="font-medium text-foreground capitalize">
                      {step.actorRole}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
