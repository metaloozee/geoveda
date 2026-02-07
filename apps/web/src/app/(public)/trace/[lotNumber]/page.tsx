"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Package,
  Sprout,
  Store,
  Truck,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TimelineStep {
  type: string;
  title: string;
  description?: string;
  actorRole: string;
  timestamp: number;
}

export default function TracePage() {
  const params = useParams();
  const lotNumber = decodeURIComponent(params.lotNumber as string);

  const data = useQuery(api.trace.getByLotNumber, { lotNumber });

  if (data === undefined) {
    return (
      <div className="container mx-auto flex h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading trace data...
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="container mx-auto flex h-[50vh] flex-col items-center justify-center gap-4">
        <h1 className="font-bold text-2xl">Lot Not Found</h1>
        <p className="text-muted-foreground">
          We couldn't find any information for Lot #
          <span className="font-mono text-foreground">{lotNumber}</span>
        </p>
        <div className="hidden" data-testid="trace-empty">
          Empty State Marker
        </div>
      </div>
    );
  }

  const { lot, timeline } = data;

  const getStepIcon = (type: string) => {
    switch (type) {
      case "harvest":
        return <Sprout className="h-5 w-5 text-green-500" />;
      case "process":
        return <Factory className="h-5 w-5 text-orange-500" />;
      case "quality_check":
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case "transport":
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case "receive":
        return <Package className="h-5 w-5 text-purple-500" />;
      case "retail":
        return <Store className="h-5 w-5 text-cyan-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatStepType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{lot.productName}</CardTitle>
              <CardDescription className="font-mono text-lg">
                {lot.lotNumber}
              </CardDescription>
            </div>
            <Badge
              variant={lot.status === "complete" ? "default" : "secondary"}
            >
              {lot.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="font-medium text-muted-foreground text-sm">
              Origin
            </span>
            <p>{lot.origin}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground text-sm">
              Created At
            </span>
            <p>{new Date(lot.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0">
        {(timeline as TimelineStep[]).map((step, index) => (
          <div
            className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
            key={`${step.timestamp}-${index}`}
          >
            <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow md:order-1 md:group-even:translate-x-1/2 md:group-odd:-translate-x-1/2">
              {getStepIcon(step.type)}
            </div>

            <Card className="w-[calc(100%-4rem)] p-4 md:w-[calc(50%-2.5rem)]">
              <div className="mb-1 flex items-center justify-between space-x-2">
                <Badge variant="outline">{formatStepType(step.type)}</Badge>
                <time className="font-mono text-muted-foreground text-xs">
                  {new Date(step.timestamp).toLocaleString()}
                </time>
              </div>
              <h3 className="mb-1 font-bold text-lg">{step.title}</h3>
              {step.description && (
                <p className="mb-2 text-muted-foreground text-sm">
                  {step.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <span className="font-medium text-foreground">Actor:</span>{" "}
                {step.actorRole}
              </div>
            </Card>
          </div>
        ))}

        {timeline.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No history available yet.
          </div>
        )}
      </div>
    </div>
  );
}
