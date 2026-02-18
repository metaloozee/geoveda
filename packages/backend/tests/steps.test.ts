import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { asWallet, ensureUser, ensureUserWithRole } from "./helpers/auth";

describe("steps functions", () => {
  it("enforces workflow order and role permissions", async () => {
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

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Coorg",
      productName: "Pepper",
    });

    await expect(
      asWallet(t, "0xprocessor").mutation(api.steps.add, {
        description: "Skipping harvest should fail",
        lotId,
        title: "Process beans",
        type: "process",
      })
    ).rejects.toBeInstanceOf(ConvexError);

    await asWallet(t, "0xfarmer").mutation(api.steps.add, {
      description: "Harvest complete",
      lotId,
      title: "Harvest lot",
      type: "harvest",
    });

    const processStepId = await asWallet(t, "0xprocessor").mutation(
      api.steps.add,
      {
        description: "Processing complete",
        lotId,
        title: "Process lot",
        type: "process",
      }
    );

    expect(processStepId).toBeDefined();
  });

  it("updates lot status and nextRequiredStep as steps are added", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Pune",
      productName: "Onion",
    });

    await asWallet(t, "0xfarmer").mutation(api.steps.add, {
      description: "Harvest complete",
      lotId,
      title: "Harvest",
      type: "harvest",
    });

    const lot = await asWallet(t, "0xfarmer").query(api.lots.getById, {
      lotId,
    });

    expect(lot?.status).toBe("in_progress");
    expect(lot?.nextRequiredStep).toBe("process");
  });
});
