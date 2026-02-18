import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateLotForm } from "./create-lot-form";

const { mutateAsync, push, toastSuccess, toastError } = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("convex/react", () => ({
  Authenticated: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@convex-dev/react-query", () => ({
  useConvexMutation: () => mutateAsync,
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    isPending: false,
    mutateAsync,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

describe("CreateLotForm", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    push.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  it("submits values and redirects on success", async () => {
    mutateAsync.mockResolvedValue({
      lotId: "lot_123",
      lotNumber: "LOT-123",
    });

    const user = userEvent.setup();
    render(<CreateLotForm />);

    await user.type(screen.getByTestId("product-name"), "Arabica Coffee");
    await user.type(screen.getByTestId("product-origin"), "Coorg");
    await user.click(screen.getByTestId("create-lot"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        origin: "Coorg",
        productName: "Arabica Coffee",
      });
      expect(toastSuccess).toHaveBeenCalledWith(
        "Lot LOT-123 created successfully"
      );
      expect(push).toHaveBeenCalledWith("/lots/lot_123");
    });
  });

  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();
    render(<CreateLotForm />);

    await user.click(screen.getByTestId("create-lot"));
    await waitFor(() => {
      expect(screen.getByText("Product name is required")).toBeVisible();
      expect(screen.getByText("Origin is required")).toBeVisible();
    });
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
