"use client";

import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const joinedDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function formatJoinedDate(timestamp?: number): string {
  if (!timestamp) {
    return "Not available";
  }

  return joinedDateFormatter.format(timestamp);
}

function formatRoleLabel(role: string): string {
  return role
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRoleVariant(role: string): "default" | "secondary" | "outline" {
  if (role === "admin") {
    return "default";
  }

  if (role === "unassigned") {
    return "outline";
  }

  return "secondary";
}

function formatWalletPreview(value: string): string {
  if (value === "Not available" || value.length < 14) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

export default function SettingsPage() {
  const { address } = useAccount();
  const { data: appUser, isPending: userPending } = useQuery(
    convexQuery(api.users.getCurrent, {})
  );
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const ensureUserMutationFn = useConvexMutation(api.users.ensureUser);
  const { mutateAsync: ensureUser, isPending: isSaving } = useMutation({
    mutationFn: ensureUserMutationFn,
  });

  const [name, setName] = useState("");

  const persistedName = appUser?.name ?? "";
  const fallbackName = session?.user?.name ?? "";
  const initialName = persistedName || fallbackName;

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const normalizedName = name.trim();
  const hasNameChanged = normalizedName !== persistedName;
  const isNameValid = normalizedName.length >= 2;
  const canSave =
    isNameValid && (hasNameChanged || appUser === null) && !isSaving;

  const role = appUser?.role ?? "unassigned";
  const fullWalletAddress =
    appUser?.walletAddress ?? address ?? "Not available";
  const walletPreview = formatWalletPreview(fullWalletAddress);
  const isWalletAvailable = fullWalletAddress !== "Not available";
  const isProfileSynced = appUser !== null;
  const joinedAt = useMemo(
    () => formatJoinedDate(appUser?.createdAt),
    [appUser?.createdAt]
  );

  const handleCopyWalletAddress = async () => {
    if (!isWalletAvailable) {
      return;
    }

    try {
      await navigator.clipboard.writeText(fullWalletAddress);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Failed to copy wallet address");
    }
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isNameValid) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    try {
      await ensureUser({ name: normalizedName });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (userPending || appUser === undefined || sessionPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:space-y-7 sm:p-6">
      <Button
        asChild
        className="w-fit text-muted-foreground"
        size="sm"
        variant="ghost"
      >
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Link>
      </Button>

      <header className="space-y-3 border-b pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getRoleVariant(role)}>
              {formatRoleLabel(role)}
            </Badge>
            {isProfileSynced ? null : (
              <Badge variant="outline">Sync required</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
          <span className="inline-flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" />
            <span className="font-mono">{walletPreview}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {joinedAt}
          </span>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-lg">Profile</h2>
          {appUser === null ? (
            <Badge variant="outline">Profile not synced yet</Badge>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleSaveProfile}>
          <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
            <Label className="sm:pt-2" htmlFor="displayName">
              Display name
            </Label>
            <div className="space-y-2">
              <Input
                id="displayName"
                maxLength={64}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                value={name}
              />
              {normalizedName.length > 0 && !isNameValid ? (
                <p className="text-destructive text-xs">
                  Name must be at least 2 characters.
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Use at least 2 characters.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button
              disabled={isSaving}
              onClick={() => setName(initialName)}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
            <Button
              data-testid="save-profile"
              disabled={!canSave}
              type="submit"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            <span className="text-muted-foreground text-xs">
              {hasNameChanged ? "Unsaved changes" : "No pending edits"}
            </span>
          </div>
        </form>
      </section>

      <section className="space-y-3 border-t pt-5">
        <h2 className="font-semibold text-lg">Account</h2>

        <dl className="divide-y rounded-lg border">
          <div className="grid gap-2 p-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-center sm:gap-3 sm:p-4">
            <dt className="text-muted-foreground text-sm">Wallet address</dt>
            <dd className="break-all font-mono text-xs">{fullWalletAddress}</dd>
            <Button
              className="w-fit"
              disabled={!isWalletAvailable}
              onClick={handleCopyWalletAddress}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:p-4">
            <dt className="text-muted-foreground text-sm">Role</dt>
            <dd>
              <Badge className="w-fit" variant={getRoleVariant(role)}>
                {formatRoleLabel(role)}
              </Badge>
            </dd>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:p-4">
            <dt className="text-muted-foreground text-sm">Joined</dt>
            <dd className="text-sm">{joinedAt}</dd>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-3 sm:p-4">
            <dt className="text-muted-foreground text-sm">Access</dt>
            <dd className="inline-flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {isProfileSynced ? "Connected" : "Waiting for sync"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
