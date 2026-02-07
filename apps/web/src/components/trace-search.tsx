"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const rawValue = detectedCodes[0].rawValue;
      if (rawValue) {
        setShowScanner(false);
        router.push(`/trace/${encodeURIComponent(rawValue)}`);
      }
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Trace Product</CardTitle>
        <CardDescription>
          Enter a lot number or scan a QR code to view product journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={handleSearch}>
          <Input
            data-testid="trace-input"
            onChange={(e) => setLotNumber(e.target.value)}
            placeholder="Enter Lot Number (e.g. LOT-123)"
            value={lotNumber}
          />
          <Button data-testid="trace-submit" type="submit">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {showScanner ? (
          <div className="space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-slate-950">
              <Scanner
                components={{
                  onOff: true,
                  torch: true,
                }}
                onError={(error) => console.error(error)}
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
            <QrCode className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
