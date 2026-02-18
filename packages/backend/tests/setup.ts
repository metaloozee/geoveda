import { afterAll, vi } from "vitest";

process.env.SITE_URL = process.env.SITE_URL ?? "http://localhost:3001";
process.env.ADMIN_WALLET_ADDRESSES =
  process.env.ADMIN_WALLET_ADDRESSES ?? "0xseedadmin";
process.env.CONVEX_TEST_USE_IDENTITY_WALLET =
  process.env.CONVEX_TEST_USE_IDENTITY_WALLET ?? "true";
process.env.CONVEX_TEST_SKIP_ANCHOR_RPC =
  process.env.CONVEX_TEST_SKIP_ANCHOR_RPC ?? "true";
process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS =
  process.env.ANCHOR_REGISTRY_CONTRACT_ADDRESS ??
  "0x1111111111111111111111111111111111111111";

const noisyConvexWarning =
  "Convex functions should not directly call other Convex functions.";

const originalConsoleError = console.error;
const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
  const [first] = args;
  if (typeof first === "string" && first.includes(noisyConvexWarning)) {
    return;
  }
  originalConsoleError(...args);
});

afterAll(() => {
  errorSpy.mockRestore();
});
