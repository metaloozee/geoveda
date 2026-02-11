/**
 * Frontend workflow helpers - must stay in sync with backend lib/workflow.ts.
 * Used for UI affordances (disable/hide actions) and error message mapping.
 */

export const STEP_ORDER = [
  "harvest",
  "process",
  "quality_check",
  "transport",
  "receive",
  "retail",
] as const;

export type StepType = (typeof STEP_ORDER)[number];

export const ROLE_STEP_PERMISSIONS: Record<string, readonly StepType[]> = {
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
} as const;

/** Error codes from backend - map to user-friendly messages */
export const WORKFLOW_ERROR_CODES = {
  STEP_ALREADY_COMPLETED: "STEP_ALREADY_COMPLETED",
  INVALID_NEXT_STEP: "INVALID_NEXT_STEP",
  FORBIDDEN: "FORBIDDEN",
  LOT_COMPLETE: "LOT_COMPLETE",
} as const;

export const STEP_LABELS: Record<StepType, string> = {
  harvest: "Harvested",
  process: "Processed",
  quality_check: "Quality Check",
  transport: "Transported",
  receive: "Received",
  retail: "Ready for Retail",
};

export function getNextStepType(
  existingTypes: readonly string[]
): StepType | null {
  const completed = new Set(existingTypes);
  if (completed.has("retail")) {
    return null;
  }
  for (const step of STEP_ORDER) {
    if (!completed.has(step)) {
      return step;
    }
  }
  return null;
}

export function isRoleAllowedForStep(
  role: string,
  stepType: StepType
): boolean {
  const allowed = ROLE_STEP_PERMISSIONS[role];
  if (!allowed) {
    return false;
  }
  return allowed.includes(stepType);
}

export function canCreateLot(role: string): boolean {
  return role === "farmer" || role === "admin";
}

export function canPerformNextStep(
  role: string,
  existingTypes: readonly string[]
): boolean {
  const next = getNextStepType(existingTypes);
  if (!next) {
    return false;
  }
  return isRoleAllowedForStep(role, next);
}

/**
 * Returns user-friendly message for the current workflow state.
 */
export function getNextStepMessage(
  nextStep: StepType | null,
  userRole: string
): string {
  if (!nextStep) {
    return "Workflow complete. No further steps can be added.";
  }
  if (isRoleAllowedForStep(userRole, nextStep)) {
    return `Next step: ${STEP_LABELS[nextStep]}`;
  }
  return `Waiting for ${STEP_LABELS[nextStep]}. Your role cannot perform this step.`;
}
