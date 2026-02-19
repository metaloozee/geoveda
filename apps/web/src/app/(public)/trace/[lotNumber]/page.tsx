"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { TimelineItem } from "@/components/step-timeline";
import { StepTimeline } from "@/components/step-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RawTimelineStep {
  type: string;
  title: string;
  description?: string;
  actorRole: string;
  actorWalletAddress?: string;
  timestamp: number;
  anchor: TimelineItem["anchor"];
}

export default function TracePage() {
  const params = useParams<{ lotNumber: string }>();
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
            <ArrowLeft className="h-4 w-4" />
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
  const rawTimeline = timeline as RawTimelineStep[];

  const timelineItems: TimelineItem[] = rawTimeline.map((step, index) => ({
    id: `${step.timestamp}-${index}`,
    type: step.type,
    title: step.title,
    description: step.description,
    actorRole: step.actorRole,
    actorWalletAddress: step.actorWalletAddress,
    timestamp: step.timestamp,
    anchor: step.anchor,
  }));

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
          <ArrowLeft className="h-4 w-4" />
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
        </CardContent>
      </Card>

      <div className="space-y-1">
        <h2 className="font-semibold text-lg tracking-tight">
          Journey Timeline
        </h2>
        <p className="text-muted-foreground text-xs">
          {timelineItems.length} step
          {timelineItems.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <StepTimeline
        createdAt={lot.createdAt}
        items={timelineItems}
        origin={lot.origin}
      />
    </div>
  );
}
