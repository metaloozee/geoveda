import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { addAnchoredStep } from "./helpers/anchoring";
import { asWallet, ensureUser, ensureUserWithRole } from "./helpers/auth";

describe("workflow integration", () => {
  it("progresses workflow across roles and updates next step", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    const farmerId = await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });
    const processorId = await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xprocessor",
      role: "processor",
      name: "Processor",
    });
    const distributorId = await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xdistributor",
      role: "distributor",
      name: "Distributor",
    });
    const retailerId = await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xretailer",
      role: "retailer",
      name: "Retailer",
    });

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Mysuru",
      productName: "Spice Mix",
    });

    await addAnchoredStep(t, {
      actorId: farmerId,
      actorRole: "farmer",
      walletAddress: "0xfarmer",
      description: "Harvest",
      lotId,
      title: "Harvest",
      type: "harvest",
    });
    await addAnchoredStep(t, {
      actorId: processorId,
      actorRole: "processor",
      walletAddress: "0xprocessor",
      description: "Process",
      lotId,
      title: "Process",
      type: "process",
    });
    await addAnchoredStep(t, {
      actorId: processorId,
      actorRole: "processor",
      walletAddress: "0xprocessor",
      description: "QC",
      lotId,
      title: "Quality check",
      type: "quality_check",
    });
    await addAnchoredStep(t, {
      actorId: distributorId,
      actorRole: "distributor",
      walletAddress: "0xdistributor",
      description: "Transport",
      lotId,
      title: "Transport",
      type: "transport",
    });
    await addAnchoredStep(t, {
      actorId: retailerId,
      actorRole: "retailer",
      walletAddress: "0xretailer",
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
