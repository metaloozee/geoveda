"use client";

import { Leaf, LogIn } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link className="flex items-center gap-2" href="/">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Geoveda</span>
        </Link>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button asChild variant="default">
            <Link href="/dashboard">
              Dashboard
              <LogIn className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
