"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useQuery } from "@tanstack/react-query";
import { Authenticated } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
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
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { AddStepForm } from "@/components/add-step-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
            value={lot.lotNumber}
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent data-testid="timeline">
              <div className="relative ml-4 space-y-0 border-muted-foreground/20 border-l pl-8">
                <div className="relative pb-8">
                  <span className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-4 ring-background">
                    <Leaf className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <time className="font-mono text-muted-foreground text-xs">
                      {format(lot.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </time>
                    <h3 className="font-semibold">Lot Created</h3>
                    <p className="text-muted-foreground text-sm">
                      Initial registration at {lot.origin}
                    </p>
                  </div>
                </div>

                {steps.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      No steps recorded yet.
                    </p>
                  </div>
                ) : (
                  steps.map((step, index) => {
                    const Icon = STEP_ICONS[step.type] ?? CheckCircle2;
                    const colorClass =
                      STEP_COLORS[step.type] ??
                      "text-muted-foreground bg-muted";
                    const isLast = index === steps.length - 1;

                    return (
                      <div
                        className={`relative ${isLast ? "pb-0" : "pb-8"}`}
                        key={step._id}
                      >
                        <span
                          className={`absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${colorClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {formatStepType(step.type)}
                            </Badge>
                            <time className="font-mono text-muted-foreground text-xs">
                              {format(
                                step.timestamp,
                                "MMM d, yyyy 'at' h:mm a"
                              )}
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
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AddStepForm lotId={lotId} lotStatus={lot.status} steps={steps} />
        </div>
      </div>
    </div>
  );
}
