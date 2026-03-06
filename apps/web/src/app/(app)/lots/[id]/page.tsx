"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useQuery } from "@tanstack/react-query";
import { Authenticated } from "convex/react";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AddStepForm } from "@/components/add-step-form";
import type { TimelineItem } from "@/components/step-timeline";
import { StepTimeline } from "@/components/step-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildTraceUrl } from "@/lib/trace-url";

export default function LotDetailPage() {
  const params = useParams<{ id: string }>();
  const lotId = params.id as Id<"lots">;

  return (
    <Authenticated>
      <LotDetailContent lotId={lotId} />
    </Authenticated>
  );
}

function LotDetailContent({ lotId }: { lotId: Id<"lots"> }) {
  const { data: user, isPending: userPending } = useQuery(
    convexQuery(api.users.getCurrent, {})
  );
  const { data: lot, isPending: lotPending } = useQuery(
    convexQuery(api.lots.getById, { lotId })
  );
  const { data: steps, isPending: stepsPending } = useQuery(
    convexQuery(api.steps.listByLot, { lotId })
  );

  if (userPending || lotPending || stepsPending || !lot || !steps || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const statusVariant =
    lot.status === "complete" ? ("default" as const) : ("secondary" as const);
  const stepRecordsForForm = steps.map((step) => ({
    type: String(step.type),
  }));

  const timelineItems: TimelineItem[] = steps.map((step) => ({
    id: step._id,
    type: String(step.type),
    title: step.title,
    description: step.description ?? undefined,
    actorRole: step.actorRole,
    actorWalletAddress: step.actorWalletAddress ?? undefined,
    timestamp: step.timestamp,
    anchor: step.anchor,
  }));

  return (
    <div className="space-y-6 p-6">
      <Button
        asChild
        className="text-muted-foreground"
        size="sm"
        variant="ghost"
      >
        <Link href={"/lots" as never}>
          <ArrowLeft className="h-4 w-4" />
          Back to Lots
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
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
          <CardFooter className="flex flex-col items-start justify-start gap-2 lg:flex-row lg:items-center lg:gap-6 lg:pt-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Origin:</span>
              <span className="font-medium">{lot.origin}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {format(lot.createdAt, "MMM d, yyyy")}
              </span>
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          <QRCodeSVG
            bgColor="transparent"
            fgColor="currentColor"
            size={120}
            value={buildTraceUrl(lot.lotNumber)}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2" data-testid="timeline">
          <StepTimeline
            createdAt={lot.createdAt}
            items={timelineItems}
            origin={lot.origin}
          />
        </div>

        <div className="space-y-6">
          <AddStepForm
            lotId={lotId}
            lotStatus={lot.status}
            steps={stepRecordsForForm}
          />
        </div>
      </div>
    </div>
  );
}
