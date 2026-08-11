import { describe, expect, it } from "vitest";
import {
  batteryEventPayload,
  custodyEventPayload,
  GENESIS_HASH,
  merkleRoot,
} from "../convex/model/custody";
import { sha256Hex } from "../convex/lib/sha256";

describe("custody event canonical payloads", () => {
  it("serialises with a fixed field order and empty slots for absent fields", () => {
    const payload = custodyEventPayload(
      0,
      { at: 1000, type: "pickup" },
      GENESIS_HASH,
    );
    expect(payload).toBe(`0|1000|pickup||||||||${GENESIS_HASH}`);
  });

  it("chains: each hash commits to the previous one", () => {
    const p0 = batteryEventPayload(
      0,
      { at: 1, type: "register", batteryId: "b1" as never },
      GENESIS_HASH,
    );
    const h0 = sha256Hex(p0);
    const p1 = batteryEventPayload(
      1,
      { at: 2, type: "grade", batteryId: "b1" as never },
      h0,
    );
    const h1 = sha256Hex(p1);
    // Tampering with event 0 changes h0 and therefore invalidates h1.
    const tampered = sha256Hex(
      batteryEventPayload(
        0,
        { at: 1, type: "register", batteryId: "b2" as never },
        GENESIS_HASH,
      ),
    );
    expect(tampered).not.toBe(h0);
    expect(sha256Hex(batteryEventPayload(1, { at: 2, type: "grade", batteryId: "b1" as never }, tampered))).not.toBe(h1);
  });
});

describe("merkleRoot", () => {
  it("returns the genesis hash for an empty set", () => {
    expect(merkleRoot([])).toBe(GENESIS_HASH);
  });

  it("is the element itself for a single leaf", () => {
    const leaf = sha256Hex("leaf");
    expect(merkleRoot([leaf])).toBe(leaf);
  });

  it("pairs hashes and duplicates the odd leaf", () => {
    const a = sha256Hex("a");
    const b = sha256Hex("b");
    const c = sha256Hex("c");
    const ab = sha256Hex(a + b);
    const cc = sha256Hex(c + c);
    expect(merkleRoot([a, b, c])).toBe(sha256Hex(ab + cc));
  });

  it("changes when any leaf changes", () => {
    const leaves = ["a", "b", "c", "d"].map(sha256Hex);
    const root = merkleRoot(leaves);
    const altered = [...leaves];
    altered[2] = sha256Hex("x");
    expect(merkleRoot(altered)).not.toBe(root);
  });
});
