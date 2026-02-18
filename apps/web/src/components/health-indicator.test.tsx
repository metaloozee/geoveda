import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HealthIndicator } from "./health-indicator";

const mockUseQuery = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock("@convex-dev/react-query", () => ({
  convexQuery: vi.fn(() => ({
    queryFn: vi.fn(),
    queryKey: ["healthCheck"],
  })),
}));

vi.mock("@geoveda/backend/convex/_generated/api", () => ({
  api: { healthCheck: { get: "health-check-get" } },
}));

describe("HealthIndicator", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("renders connecting state before query resolves", () => {
    mockUseQuery.mockReturnValue({ data: undefined });
    render(<HealthIndicator />);
    expect(screen.getByText("Connecting...")).toBeVisible();
  });

  it("renders healthy state when backend returns OK", () => {
    mockUseQuery.mockReturnValue({ data: "OK" });
    render(<HealthIndicator />);
    expect(screen.getByText("All systems operational")).toBeVisible();
  });

  it("renders degraded state when backend does not return OK", () => {
    mockUseQuery.mockReturnValue({ data: "FAIL" });
    render(<HealthIndicator />);
    expect(screen.getByText("Service disrupted")).toBeVisible();
  });
});
