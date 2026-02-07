"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { Authenticated, useMutation, useQuery } from "convex/react";
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
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const ROLE_STEP_PERMISSIONS: Record<string, string[]> = {
  farmer: ["harvest"],
  processor: ["process", "quality_check"],
  distributor: ["transport"],
  retailer: ["receive", "retail"],
  admin: [
    "harvest",
    "process",
    "quality_check",
    "transport",
    "receive",
    "retail",
  ],
};

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

const STEP_LABELS: Record<string, string> = {
  harvest: "Harvested",
  process: "Processed",
  quality_check: "Quality Check",
  transport: "Transported",
  receive: "Received",
  retail: "Ready for Retail",
};

const formatStepType = (type: string) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function LotDetailContent() {
  const params = useParams();
  const lotId = params.id as Id<"lots">;

  const user = useQuery(api.users.getCurrent);
  const lot = useQuery(api.lots.getById, { lotId });
  const steps = useQuery(api.steps.listByLot, { lotId });
  const addStep = useMutation(api.steps.add);

  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStep, setNewStep] = useState({
    type: "",
    title: "",
    description: "",
  });

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingStep(true);
    try {
      await addStep({
        lotId,
        type: newStep.type as
          | "harvest"
          | "process"
          | "quality_check"
          | "transport"
          | "receive"
          | "retail",
        title: newStep.title,
        description: newStep.description || undefined,
      });
      toast.success("Step added successfully");
      setNewStep({ type: "", title: "", description: "" });
    } catch {
      toast.error("Failed to add step");
    } finally {
      setIsAddingStep(false);
    }
  };

  if (!(lot && steps && user)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const allowedStepTypes = user.role
    ? (ROLE_STEP_PERMISSIONS[user.role] ?? [])
    : [];

  const statusVariant =
    lot.status === "complete" ? ("default" as const) : ("secondary" as const);

  return (
    <div className="space-y-6 p-6">
      <Button
        className="text-muted-foreground"
        render={<Link href={"/lots" as never} />}
        size="sm"
        variant="ghost"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Lots
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {format(lot.createdAt, "MMM d, yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6">
          <QRCodeSVG
            bgColor="transparent"
            fgColor="currentColor"
            size={140}
            value={lot.lotNumber}
          />
          <p className="mt-3 text-center text-muted-foreground text-xs">
            Scan to verify authenticity
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Journey Timeline</h2>
              <p className="text-muted-foreground text-sm">
                {steps.length} step{steps.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6" data-testid="timeline">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Update</CardTitle>
              <CardDescription>
                Record a new step in the journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allowedStepTypes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    You don&apos;t have permission to add steps.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleAddStep}>
                  <div className="space-y-2">
                    <Label>Step Type</Label>
                    <Select
                      onValueChange={(val) =>
                        setNewStep((prev) => ({ ...prev, type: val || "" }))
                      }
                      required
                      value={newStep.type}
                    >
                      <SelectTrigger data-testid="step-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedStepTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {STEP_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      data-testid="step-title"
                      onChange={(e) =>
                        setNewStep((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Quality Grade A"
                      required
                      value={newStep.title}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      onChange={(e) =>
                        setNewStep((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Additional details..."
                      value={newStep.description}
                    />
                  </div>

                  <Button
                    className="w-full"
                    data-testid="add-step"
                    disabled={isAddingStep}
                    type="submit"
                  >
                    {isAddingStep && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Step
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LotDetailPage() {
  return (
    <Authenticated>
      <LotDetailContent />
    </Authenticated>
  );
}
