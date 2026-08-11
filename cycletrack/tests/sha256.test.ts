import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { sha256Hex } from "../convex/lib/sha256";

describe("sha256Hex", () => {
  it("matches FIPS 180-4 vectors", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(
      sha256Hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  it("agrees with node:crypto across lengths and unicode", () => {
    const samples = [
      "a",
      "hello world",
      "x".repeat(55),
      "x".repeat(56),
      "x".repeat(64),
      "x".repeat(1000),
      "chaîne accentuée ✓",
      "emoji 🔋♻️ and CJK 電池",
    ];
    for (const s of samples) {
      expect(sha256Hex(s)).toBe(
        createHash("sha256").update(s, "utf8").digest("hex"),
      );
    }
  });
});
