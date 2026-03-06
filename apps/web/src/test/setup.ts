import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
}

if (!process.env.NEXT_PUBLIC_CONVEX_SITE_URL) {
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://test.geoveda.local";
}

process.env.SITE_URL = "https://test.geoveda.local";
