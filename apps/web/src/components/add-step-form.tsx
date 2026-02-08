"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
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

const STEP_LABELS: Record<string, string> = {
  harvest: "Harvested",
  process: "Processed",
  quality_check: "Quality Check",
  transport: "Transported",
  receive: "Received",
  retail: "Ready for Retail",
};

interface AddStepFormProps {
  lotId: Id<"lots">;
}

export function AddStepForm({ lotId }: AddStepFormProps) {
  const { data: user } = useQuery(convexQuery(api.users.getCurrent, {}));
  const addStepMutationFn = useConvexMutation(api.steps.add);
  const { mutateAsync: addStep, isPending } = useMutation({
    mutationFn: addStepMutationFn,
  });

  const form = useForm({
    defaultValues: {
      type: "",
      title: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await addStep({
          lotId,
          type: value.type as
            | "harvest"
            | "process"
            | "quality_check"
            | "transport"
            | "receive"
            | "retail",
          title: value.title,
          description: value.description || undefined,
        });
        toast.success("Step added successfully");
        form.reset();
      } catch {
        toast.error("Failed to add step");
      }
    },
  });

  const allowedStepTypes = user?.role
    ? (ROLE_STEP_PERMISSIONS[user.role] ?? [])
    : [];

  if (allowedStepTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Update</CardTitle>
          <CardDescription>Record a new step in the journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              You don&apos;t have permission to add steps.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Update</CardTitle>
        <CardDescription>Record a new step in the journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="type"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Step type is required",
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Step Type</Label>
                <Select
                  onValueChange={(value) => field.handleChange(value)}
                  value={field.state.value}
                >
                  <SelectTrigger
                    aria-invalid={field.state.meta.errors.length > 0}
                    data-testid="step-type"
                    id={field.name}
                  >
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
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "Title is required",
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Title</Label>
                <Input
                  aria-invalid={field.state.meta.errors.length > 0}
                  data-testid="step-title"
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Quality Grade A"
                  value={field.state.value}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Textarea
                  id={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Additional details..."
                  value={field.state.value}
                />
              </div>
            )}
          </form.Field>

          <Button
            className="w-full"
            data-testid="add-step"
            disabled={isPending}
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Step
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
