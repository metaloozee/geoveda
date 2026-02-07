"use client";

import { api } from "@geoveda/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthBootstrap() {
  const { data: session } = authClient.useSession();
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (session?.user) {
      // Sync user to Convex DB
      // We don't need to pass arguments as ensureUser uses `ctx.auth`
      ensureUser({})
        .then(() => {
          console.log("User synced to Convex");
        })
        .catch((err) => {
          console.error("Failed to sync user:", err);
        });
    }
  }, [session?.user, ensureUser]);

  return null;
}
