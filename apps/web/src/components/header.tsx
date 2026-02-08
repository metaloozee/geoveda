import { Leaf } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex flex-row items-center justify-center">
          <Link className="flex items-center gap-2" href="/">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">Geoveda</span>
          </Link>
          <div className="flex flex-row items-center justify-center gap-4 px-6 text-muted-foreground">
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
