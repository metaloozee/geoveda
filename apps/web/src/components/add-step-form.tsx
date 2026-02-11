"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import type { Id } from "@geoveda/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
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
import { Textarea } from "@/components/ui/textarea";
import {
  getNextStepMessage,
  getNextStepType,
  isRoleAllowedForStep,
  WORKFLOW_ERROR_CODES,
} from "@/lib/workflow";

interface StepRecord {
  type: string;
}

interface AddStepFormProps {
  lotId: Id<"lots">;
  steps: StepRecord[];
  lotStatus: string;
}

const formatStepAction = (step: string) =>
  step.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

export function AddStepForm({ lotId, steps, lotStatus }: AddStepFormProps) {
  const { data: user } = useQuery(convexQuery(api.users.getCurrent, {}));
  const addStepMutationFn = useConvexMutation(api.steps.add);
  const { mutateAsync: addStep, isPending } = useMutation({
    mutationFn: addStepMutationFn,
  });

  const existingTypes = steps.map((s) => s.type);
  const nextStep = getNextStepType(existingTypes);
  const isComplete = lotStatus === "complete" || nextStep === null;
  let canPerformNextStep = false;
  if (user?.role && nextStep) {
    canPerformNextStep = isRoleAllowedForStep(user.role, nextStep);
  }

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      if (!canPerformNextStep) {
        return;
      }
      if (!nextStep) {
        return;
      }
      try {
        await addStep({
          lotId,
          type: nextStep,
          title: value.title,
          description: value.description || undefined,
        });
        toast.success("Step added successfully");
        form.reset();
      } catch (err) {
        const msg =
          err instanceof ConvexError
            ? (() => {
                const data = err.data as { code?: string; message?: string };
                switch (data.code) {
                  case WORKFLOW_ERROR_CODES.STEP_ALREADY_COMPLETED:
                    return "This step has already been recorded for this lot.";
                  case WORKFLOW_ERROR_CODES.INVALID_NEXT_STEP:
                    return data.message ?? "Step cannot be added yet.";
                  case WORKFLOW_ERROR_CODES.LOT_COMPLETE:
                    return "Workflow is complete. No further steps can be added.";
                  case "FORBIDDEN":
                    return data.message ?? "You do not have permission.";
                  default:
                    return data.message ?? "Failed to add step.";
                }
              })()
            : "Failed to add step.";
        toast.error(msg);
      }
    },
  });

  const statusMessage = getNextStepMessage(nextStep, user?.role ?? "");

  if (isComplete) {
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
              Workflow complete. No further steps can be added.
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
        <CardDescription>{statusMessage}</CardDescription>
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
            disabled={isPending || !nextStep || !canPerformNextStep}
            type="submit"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {nextStep
              ? `Perform ${formatStepAction(nextStep)}`
              : "No Step Available"}
          </Button>
          {!canPerformNextStep && nextStep && (
            <p className="text-center text-muted-foreground text-xs">
              You do not have permission for this step.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
