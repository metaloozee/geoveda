import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { asWallet, ensureUser, ensureUserWithRole } from "./helpers/auth";

describe("lots functions", () => {
  it("allows farmers to create a lot", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });

    const lot = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Nashik",
      productName: "Arabica Beans",
    });

    expect(lot.lotNumber.startsWith("LOT-")).toBe(true);

    const created = await asWallet(t, "0xfarmer").query(api.lots.getById, {
      lotId: lot.lotId,
    });

    expect(created?.status).toBe("created");
    expect(created?.nextRequiredStep).toBe("harvest");
  });

  it("blocks non-farmer roles from creating lots", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xprocessor",
      role: "processor",
      name: "Processor",
    });

    await expect(
      asWallet(t, "0xprocessor").mutation(api.lots.create, {
        origin: "Nashik",
        productName: "Arabica Beans",
      })
    ).rejects.toBeInstanceOf(ConvexError);
  });
});
