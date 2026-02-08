"use client";

import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@geoveda/backend/convex/_generated/api";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthBootstrap() {
  const { data: session } = authClient.useSession();
  const ensureUserMutationFn = useConvexMutation(api.users.ensureUser);
  const { mutateAsync: ensureUser } = useMutation({
    mutationFn: ensureUserMutationFn,
  });

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
