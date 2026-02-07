"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { Authenticated, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Loader2,
  MapPin,
  Sprout,
  Store,
  Truck,
  User,
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STEP_ICONS: Record<string, any> = {
  harvest: Sprout,
  process: Factory,
  quality_check: ClipboardCheck,
  transport: Truck,
  receive: ArrowRight,
  retail: Store,
};

const STEP_LABELS: Record<string, string> = {
  harvest: "Harvested",
  process: "Processed",
  quality_check: "Quality Check",
  transport: "Transported",
  receive: "Received",
  retail: "Ready for Retail",
};

export default function LotDetailPage() {
  const params = useParams();
  const lotId = params.id as Id<"lots">;

  // Cast api to any to avoid type errors when codegen hasn't run fully
  const safeApi = api as any;

  const user = useQuery(safeApi.users.getCurrent);
  const lot = useQuery(safeApi.lots.getById, { lotId });
  const steps = useQuery(safeApi.steps.listByLot, { lotId });
  const addStep = useMutation(safeApi.steps.add);

  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStep, setNewStep] = useState<{
    type: string;
    title: string;
    description: string;
  }>({
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
        type: newStep.type,
        title: newStep.title,
        description: newStep.description,
      });
      toast.success("Step added successfully");
      setNewStep({ type: "", title: "", description: "" });
    } catch (error) {
      console.error("Failed to add step:", error);
      toast.error("Failed to add step");
    } finally {
      setIsAddingStep(false);
    }
  };

  if (!(lot && steps && user)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allowedStepTypes = user.role
    ? ROLE_STEP_PERMISSIONS[user.role] || []
    : [];

  return (
    <div className="container mx-auto space-y-8 py-8">
      <Authenticated>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{lot.productName}</CardTitle>
                  <CardDescription className="mt-1 font-mono">
                    {lot.lotNumber}
                  </CardDescription>
                </div>
                <Badge
                  variant={lot.status === "complete" ? "default" : "secondary"}
                >
                  {lot.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Origin:</span>
                  <span>{lot.origin}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span>{format(lot.createdAt, "PPP")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col items-center justify-center bg-white p-6">
            <QRCodeSVG size={150} value={lot.lotNumber} />
            <p className="mt-4 text-center text-muted-foreground text-xs">
              Scan to verify authenticity
            </p>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Journey Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4" data-testid="timeline">
                <div className="relative ml-4 space-y-8 border-muted border-l pb-4">
                  <div className="relative pl-8">
                    <span className="absolute top-1 -left-[5px] flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-muted-foreground text-sm">
                        {format(lot.createdAt, "PP p")}
                      </span>
                      <h4 className="font-semibold">Lot Created</h4>
                      <p className="text-muted-foreground text-sm">
                        Initial registration at {lot.origin}
                      </p>
                    </div>
                  </div>

                  {steps.map((step: any) => {
                    const Icon = STEP_ICONS[step.type] || CheckCircle2;
                    return (
                      <div className="relative pl-8" key={step._id}>
                        <span className="absolute top-1 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-4 ring-background">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-muted-foreground text-sm">
                            {format(step.timestamp, "PP p")}
                          </span>
                          <h4 className="font-semibold">{step.title}</h4>
                          <Badge className="mb-1 w-fit" variant="outline">
                            {STEP_LABELS[step.type]}
                          </Badge>
                          {step.description && (
                            <p className="rounded-md bg-muted/50 p-2 text-muted-foreground text-sm">
                              {step.description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
                            <User className="h-3 w-3" />
                            <span>Actor: {step.actorRole}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Update</CardTitle>
                <CardDescription>
                  Record a new step in the journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allowedStepTypes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    You don't have permission to add steps to this lot.
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleAddStep}>
                    <div className="space-y-2">
                      <Label>Step Type</Label>
                      <Select
                        onValueChange={(val) =>
                          setNewStep({ ...newStep, type: val || "" })
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
                          setNewStep({ ...newStep, title: e.target.value })
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
                          setNewStep({
                            ...newStep,
                            description: e.target.value,
                          })
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
      </Authenticated>
    </div>
  );
}
