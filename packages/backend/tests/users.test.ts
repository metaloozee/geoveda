import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { asWallet, ensureUser } from "./helpers/auth";

describe("users functions", () => {
  it("assigns admin role to configured admin wallet", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Seed Admin");

    const currentUser = await asWallet(t, "0xseedadmin").query(
      api.users.getCurrent,
      {}
    );

    expect(currentUser?.role).toBe("admin");
  });

  it("promotes first non-configured user to admin", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xfirst", "First User");

    const currentUser = await asWallet(t, "0xfirst").query(
      api.users.getCurrent,
      {}
    );
    expect(currentUser?.role).toBe("admin");
  });

  it("prevents admins from removing their own admin role", async () => {
    const t = createBackendTest();
    const adminUserId = await ensureUser(t, "0xseedadmin", "Seed Admin");

    await expect(
      asWallet(t, "0xseedadmin").mutation(api.users.setRole, {
        role: "farmer",
        userId: adminUserId,
      })
    ).rejects.toBeInstanceOf(ConvexError);
  });
});
