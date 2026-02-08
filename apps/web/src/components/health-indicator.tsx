"use client";

import { convexQuery } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "@tanstack/react-query";

function getHealthDotClass(healthCheck: string | undefined): string {
  if (healthCheck === "OK") {
    return "bg-green-500";
  }
  if (healthCheck === undefined) {
    return "animate-pulse bg-muted-foreground";
  }
  return "bg-destructive";
}

function getHealthLabel(healthCheck: string | undefined): string {
  if (healthCheck === "OK") {
    return "All systems operational";
  }
  if (healthCheck === undefined) {
    return "Connecting...";
  }
  return "Service disrupted";
}

export function HealthIndicator() {
  const { data: healthCheck } = useQuery(convexQuery(api.healthCheck.get, {}));

  return (
    <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm shadow-sm">
      <span
        className={`h-2 w-2 rounded-full ${getHealthDotClass(healthCheck)}`}
      />
      <span className="text-muted-foreground">
        {getHealthLabel(healthCheck)}
      </span>
    </div>
  );
}
