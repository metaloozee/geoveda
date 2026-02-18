import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { asWallet, ensureUser, ensureUserWithRole } from "./helpers/auth";

describe("workflow integration", () => {
  it("progresses workflow across roles and updates next step", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xprocessor",
      role: "processor",
      name: "Processor",
    });
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xdistributor",
      role: "distributor",
      name: "Distributor",
    });
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xretailer",
      role: "retailer",
      name: "Retailer",
    });

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Mysuru",
      productName: "Spice Mix",
    });

    await asWallet(t, "0xfarmer").mutation(api.steps.add, {
      description: "Harvest",
      lotId,
      title: "Harvest",
      type: "harvest",
    });
    await asWallet(t, "0xprocessor").mutation(api.steps.add, {
      description: "Process",
      lotId,
      title: "Process",
      type: "process",
    });
    await asWallet(t, "0xprocessor").mutation(api.steps.add, {
      description: "QC",
      lotId,
      title: "Quality check",
      type: "quality_check",
    });
    await asWallet(t, "0xdistributor").mutation(api.steps.add, {
      description: "Transport",
      lotId,
      title: "Transport",
      type: "transport",
    });
    await asWallet(t, "0xretailer").mutation(api.steps.add, {
      description: "Receive",
      lotId,
      title: "Receive",
      type: "receive",
    });
    const completedLot = await asWallet(t, "0xretailer").query(
      api.lots.getById,
      {
        lotId,
      }
    );

    expect(completedLot?.status).toBe("in_progress");
    expect(completedLot?.nextRequiredStep).toBe("retail");
  });
});
