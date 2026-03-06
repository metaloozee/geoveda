"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveScanNavigationTarget } from "@/lib/trace-url";

export function TraceSearch() {
  const [lotNumber, setLotNumber] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lotNumber.trim()) {
      router.push(`/trace/${encodeURIComponent(lotNumber.trim())}`);
    }
  };

  const handleScan = (detectedCodes: { rawValue?: string }[]) => {
    if (detectedCodes.length === 0) {
      return;
    }

    const rawValue = detectedCodes[0].rawValue?.trim();
    if (!rawValue) {
      return;
    }

    setShowScanner(false);
    const target = resolveScanNavigationTarget(
      rawValue,
      window.location.origin
    );

    if (target.type === "internal") {
      router.push(target.href as never);
      return;
    }

    window.location.assign(target.href);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <form className="flex gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            data-testid="trace-input"
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="Enter lot number (e.g. LOT-001)"
            value={lotNumber}
          />
        </div>
        <Button data-testid="trace-submit" type="submit">
          Search
        </Button>
      </form>

      {showScanner ? (
        <div className="space-y-2">
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-black">
            <Scanner
              components={{
                onOff: true,
                torch: true,
              }}
              onError={(error) => {
                throw new Error(
                  error instanceof Error ? error.message : "Scanner error"
                );
              }}
              onScan={handleScan}
            />
            <Button
              className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setShowScanner(false)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-muted-foreground text-xs">
            Point your camera at a QR code
          </p>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={() => setShowScanner(true)}
          variant="outline"
        >
          <Camera className="h-4 w-4" />
          Scan QR Code
        </Button>
      )}
    </div>
  );
}
