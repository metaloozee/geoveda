"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Leaf,
  MapPin,
  Package,
  Sprout,
  Store,
  Truck,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { AnchorStatusBadge } from "@/components/anchor-status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AnchorInfo } from "@/lib/anchor-types";

export interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  actorRole: string;
  actorWalletAddress?: string;
  timestamp: number;
  anchor: AnchorInfo | null;
}

interface StepTimelineProps {
  items: TimelineItem[];
  createdAt: number;
  origin: string;
  footer?: ReactNode;
}

const STEP_ICONS: Record<string, typeof Sprout> = {
  harvest: Sprout,
  process: Factory,
  quality_check: ClipboardCheck,
  transport: Truck,
  receive: Package,
  retail: Store,
};

const STEP_ACCENT: Record<
  string,
  { icon: string; ring: string; badge: string }
> = {
  harvest: {
    icon: "text-green-700 dark:text-green-400",
    ring: "ring-green-200 dark:ring-green-900",
    badge:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/60 dark:text-green-400",
  },
  process: {
    icon: "text-orange-700 dark:text-orange-400",
    ring: "ring-orange-200 dark:ring-orange-900",
    badge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-400",
  },
  quality_check: {
    icon: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-900",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400",
  },
  transport: {
    icon: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-900",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-400",
  },
  receive: {
    icon: "text-purple-700 dark:text-purple-400",
    ring: "ring-purple-200 dark:ring-purple-900",
    badge:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-400",
  },
  retail: {
    icon: "text-cyan-700 dark:text-cyan-400",
    ring: "ring-cyan-200 dark:ring-cyan-900",
    badge:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-400",
  },
};

const DEFAULT_ACCENT = {
  icon: "text-muted-foreground",
  ring: "ring-border",
  badge: "border-border bg-muted text-muted-foreground",
};

const formatStepType = (type: string): string =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function TimelineConnector({ isLast }: { isLast: boolean }) {
  if (isLast) {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      className="absolute top-12 -bottom-2 left-5 w-px bg-linear-to-b from-border to-border/40"
    />
  );
}

function OriginNode({
  createdAt,
  origin,
}: {
  createdAt: number;
  origin: string;
}) {
  return (
    <div className="relative flex gap-4 pb-8">
      <span
        aria-hidden="true"
        className="absolute top-12 -bottom-2 left-5 w-px bg-linear-to-b from-primary/40 to-border"
      />
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-[3px] ring-primary/20">
        <Leaf className="h-5 w-5 text-primary" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm tracking-tight">
            Lot Created
          </span>
          <time className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
            {format(createdAt, "MMM d, yyyy · h:mm a")}
          </time>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>Origin registered at {origin}</span>
        </div>
      </div>
    </div>
  );
}

function StepNode({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
  const Icon = STEP_ICONS[item.type] ?? CheckCircle2;
  const accent = STEP_ACCENT[item.type] ?? DEFAULT_ACCENT;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      <TimelineConnector isLast={isLast} />
      {/* icon bubble */}
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background ring-[3px] ${accent.ring}`}
      >
        <Icon className={`h-5 w-5 ${accent.icon}`} />
      </div>
      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        {/* header row: badge + time */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={accent.badge} variant="outline">
            {formatStepType(item.type)}
          </Badge>
          <time className="font-mono text-[0.65rem] text-muted-foreground tabular-nums">
            {format(item.timestamp, "MMM d, yyyy · h:mm a")}
          </time>
        </div>

        {/* title */}
        <h3 className="font-semibold text-sm leading-snug tracking-tight">
          {item.title}
        </h3>

        {/* description */}
        {item.description && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {item.description}
          </p>
        )}

        {/* metadata row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <User className="h-3 w-3 shrink-0" />
                  <span className="capitalize">{item.actorRole}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {item.actorWalletAddress ? (
                  <span className="font-mono text-[0.65rem]">
                    {item.actorWalletAddress}
                  </span>
                ) : (
                  <span>Actor: {item.actorRole}</span>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator className="h-3" orientation="vertical" />
          <AnchorStatusBadge anchor={item.anchor} />
        </div>
      </div>
    </div>
  );
}

function EmptyTimeline() {
  return (
    <div className="relative flex gap-4 py-2">
      {/* static dot */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 border-dashed bg-background" />
      {/* message */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-muted-foreground/30 border-dashed px-4 py-8">
        <Package className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No steps recorded yet</p>
        <p className="max-w-xs text-center text-muted-foreground/70 text-xs">
          Steps will appear here as the product moves through its supply chain
          journey.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function StepTimeline({
  items,
  createdAt,
  origin,
  footer,
}: StepTimelineProps) {
  return (
    <section aria-label="Supply chain timeline" className="relative">
      <OriginNode createdAt={createdAt} origin={origin} />

      {items.length === 0 ? (
        <EmptyTimeline />
      ) : (
        items.map((item, index) => (
          <StepNode
            isLast={index === items.length - 1 && !footer}
            item={item}
            key={item.id}
          />
        ))
      )}

      {footer && (
        <div className="relative flex gap-4 pt-0">
          {/* no more connector */}
          <div className="w-10 shrink-0" />
          <div className="min-w-0 flex-1">{footer}</div>
        </div>
      )}
    </section>
  );
}
