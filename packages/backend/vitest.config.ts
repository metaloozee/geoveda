import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
    onConsoleLog(log) {
      if (
        log.includes(
          "Convex functions should not directly call other Convex functions."
        )
      ) {
        return false;
      }
    },
  },
});
