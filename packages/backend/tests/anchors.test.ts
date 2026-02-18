import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { hashAnchorPayload, makeStepIntentKey } from "../../anchoring/src";
import { api } from "../convex/_generated/api";
import { createBackendTest } from "./harness";
import { asWallet, ensureUser, ensureUserWithRole } from "./helpers/auth";

describe("anchors action", () => {
  it("creates step and anchor when proof payload matches", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    const farmerId = await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Kodagu",
      productName: "Coffee",
    });

    const timestamp = Date.now();
    const stepKey = makeStepIntentKey({
      lotId,
      type: "harvest",
      actorWalletAddress: "0xfarmer",
      timestamp,
    });
    const dataHash = hashAnchorPayload({
      version: "1",
      stepId: stepKey,
      lotId,
      type: "harvest",
      title: "Harvest",
      description: "Harvest complete",
      actorId: farmerId,
      actorWalletAddress: "0xfarmer",
      actorRole: "farmer",
      timestamp,
    });

    const stepId = await asWallet(t, "0xfarmer").action(
      api.anchorsActions.verifyAnchorAndCreateStep,
      {
        lotId,
        type: "harvest",
        title: "Harvest",
        description: "Harvest complete",
        timestamp,
        txHash: `0x${"2".repeat(64)}`,
        dataHash,
        stepKey,
        chainId: 84_532,
        contractAddress: "0x1111111111111111111111111111111111111111",
      }
    );

    const anchor = await asWallet(t, "0xfarmer").query(
      api.anchors.getByStepId,
      {
        stepId,
      }
    );
    expect(anchor?.status).toBe("anchored");
    expect(anchor?.chainId).toBe(84_532);
  });

  it("rejects mismatched data hash", async () => {
    const t = createBackendTest();
    await ensureUser(t, "0xseedadmin", "Admin");
    await ensureUserWithRole(t, {
      adminWallet: "0xseedadmin",
      walletAddress: "0xfarmer",
      role: "farmer",
      name: "Farmer",
    });

    const { lotId } = await asWallet(t, "0xfarmer").mutation(api.lots.create, {
      origin: "Coorg",
      productName: "Pepper",
    });

    const timestamp = Date.now();
    const stepKey = makeStepIntentKey({
      lotId,
      type: "harvest",
      actorWalletAddress: "0xfarmer",
      timestamp,
    });

    await expect(
      asWallet(t, "0xfarmer").action(
        api.anchorsActions.verifyAnchorAndCreateStep,
        {
          lotId,
          type: "harvest",
          title: "Harvest",
          description: "Harvest complete",
          timestamp,
          txHash: `0x${"3".repeat(64)}`,
          dataHash: `0x${"4".repeat(64)}`,
          stepKey,
          chainId: 84_532,
          contractAddress: "0x1111111111111111111111111111111111111111",
        }
      )
    ).rejects.toBeInstanceOf(ConvexError);
  });
});
