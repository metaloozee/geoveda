/**
 * Canonical workflow definition for supply chain lots.
 * Single source of truth for step order, role permissions, and access rules.
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

/** Error codes returned by backend for frontend mapping */
export const WORKFLOW_ERROR_CODES = {
  STEP_ALREADY_COMPLETED: "STEP_ALREADY_COMPLETED",
  INVALID_NEXT_STEP: "INVALID_NEXT_STEP",
  FORBIDDEN: "FORBIDDEN",
  LOT_COMPLETE: "LOT_COMPLETE",
} as const;

/**
 * Returns the next required step type given existing step types.
 * Returns null if workflow is complete (retail already done).
 */
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

/**
 * Returns true if the role is allowed to perform the given step type.
 */
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

/**
 * Returns true only for farmer and admin. Only they can create lots.
 */
export function canCreateLot(role: string): boolean {
  return role === "farmer" || role === "admin";
}

/**
 * Returns true if the user can perform the next required step for the lot.
 */
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

export interface LotForAccess {
  createdBy: string;
  nextRequiredStep?: string | null;
}

export interface StepForAccess {
  actorId: string;
}

/**
 * Returns true if the user can view and act on the lot.
 * Access: admin, creator, participant (has added a step), or next step matches role.
 */
export function canAccessLot(
  appUser: { _id: string; role: string },
  lot: LotForAccess,
  lotSteps: StepForAccess[]
): boolean {
  if (appUser.role === "admin") {
    return true;
  }
  if (lot.createdBy === appUser._id) {
    return true;
  }
  if (lotSteps.some((s) => s.actorId === appUser._id)) {
    return true;
  }
  const next = lot.nextRequiredStep;
  if (next && isRoleAllowedForStep(appUser.role, next as StepType)) {
    return true;
  }
  return false;
}
