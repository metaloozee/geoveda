"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { ArrowRight, Leaf, Link2, ScanLine, Shield } from "lucide-react";
import Link from "next/link";
import { TraceSearch } from "@/components/trace-search";
import { Button } from "@/components/ui/button";

function getHealthDotClass(healthCheck: string | undefined): string {
  if (healthCheck === "OK") {
    return "bg-success";
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

export default function Home() {
  const healthCheck = useQuery(api.healthCheck.get);

  return (
    <div className="flex flex-col">
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm shadow-sm">
          <span
            className={`h-2 w-2 rounded-full ${getHealthDotClass(healthCheck)}`}
          />
          <span className="text-muted-foreground">
            {getHealthLabel(healthCheck)}
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="font-bold text-4xl tracking-tight sm:text-5xl">
            Know your product's
            <br />
            <span className="text-primary">entire journey</span>
          </h1>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Blockchain-backed traceability for agricultural supply chains. From
            seed to shelf, every step verified.
          </p>
        </div>

        <div className="flex gap-3">
          <Button render={<Link href="/dashboard" />} size="lg">
            Get started
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
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
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-16 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ScanLine className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Instant Tracing</h3>
          <p className="text-muted-foreground text-sm">
            Scan a QR code or enter a lot number to see the full product
            history.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Chain of Custody</h3>
          <p className="text-muted-foreground text-sm">
            Every handoff is recorded. Farmers, processors, distributors, and
            retailers all contribute.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Tamper-proof</h3>
          <p className="text-muted-foreground text-sm">
            Append-only records anchored to the blockchain. Once logged, data
            cannot be altered.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-24" id="trace">
        <div className="flex flex-col items-center gap-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold text-2xl tracking-tight">
              Trace a product
            </h2>
            <p className="text-muted-foreground">
              Enter a lot number or scan a QR code to see its journey.
            </p>
          </div>
          <TraceSearch />
        </div>
      </section>
    </div>
  );
}
