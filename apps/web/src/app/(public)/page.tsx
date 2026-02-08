import { Leaf, Link2, ScanLine, Shield } from "lucide-react";
import Link from "next/link";
import { HealthIndicator } from "@/components/health-indicator";
import { TraceButton } from "@/components/trace-button";
import { TraceSearch } from "@/components/trace-search";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-primary/2 to-transparent" />

        <HealthIndicator />

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
          <Button asChild size="lg">
            <Link href="/dashboard">Get started</Link>
          </Button>
          <TraceButton />
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
