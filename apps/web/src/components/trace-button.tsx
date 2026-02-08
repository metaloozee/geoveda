"use client";

import { Button } from "@/components/ui/button";

export function TraceButton() {
  return (
    <Button
      onClick={() => {
        document
          .getElementById("trace")
          ?.scrollIntoView({ behavior: "smooth" });
      }}
      size="lg"
      variant="outline"
    >
      Trace a product
    </Button>
  );
}
