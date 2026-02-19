"use client";

import { env } from "@geoveda/env/web";
import { Badge } from "@/components/ui/badge";
import type { AnchorInfo } from "@/lib/anchor-types";

export function AnchorStatusBadge({ anchor }: { anchor: AnchorInfo | null }) {
  if (!anchor) {
    return <Badge variant="secondary">Unanchored</Badge>;
  }

  if (anchor.status === "anchored") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Anchored</Badge>
        <a
          className="font-mono text-primary text-xs underline underline-offset-2"
          href={`${env.NEXT_PUBLIC_BASE_SEPOLIA_EXPLORER_URL}/tx/${anchor.txHash}`}
          rel="noreferrer"
          target="_blank"
        >
          {anchor.txHash.slice(0, 10)}...
        </a>
      </div>
    );
  }

  if (anchor.status === "verification_failed") {
    return <Badge variant="destructive">Verification Failed</Badge>;
  }

  return <Badge variant="outline">Legacy Unanchored</Badge>;
}
