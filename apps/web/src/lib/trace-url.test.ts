import { describe, expect, it } from "vitest";
import { buildTraceUrl, resolveScanNavigationTarget } from "./trace-url";

describe("buildTraceUrl", () => {
  it("builds an absolute trace URL from SITE_URL", () => {
    expect(buildTraceUrl("LOT-123")).toBe(
      "https://test.geoveda.local/trace/LOT-123"
    );
  });

  it("encodes special characters in lot numbers", () => {
    expect(buildTraceUrl("LOT 12/3")).toBe(
      "https://test.geoveda.local/trace/LOT%2012%2F3"
    );
  });
});

describe("resolveScanNavigationTarget", () => {
  it("routes raw lot payloads to internal trace paths", () => {
    expect(
      resolveScanNavigationTarget("LOT-777", "https://test.geoveda.local")
    ).toEqual({
      type: "internal",
      href: "/trace/LOT-777",
    });
  });

  it("routes same-origin URL payloads internally", () => {
    expect(
      resolveScanNavigationTarget(
        "https://test.geoveda.local/trace/LOT-777?from=qr",
        "https://test.geoveda.local"
      )
    ).toEqual({
      type: "internal",
      href: "/trace/LOT-777?from=qr",
    });
  });

  it("routes cross-origin URL payloads externally", () => {
    expect(
      resolveScanNavigationTarget(
        "https://other.example/trace/LOT-777",
        "https://test.geoveda.local"
      )
    ).toEqual({
      type: "external",
      href: "https://other.example/trace/LOT-777",
    });
  });
});
