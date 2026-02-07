import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { inferAdditionalFields, siweClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    siweClient(),
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
        },
      },
    }),
  ],
});
