import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatKg,
  formatPct,
  formatTimeAgo,
  truncateHash,
} from "../src/lib/format";
import { computeImpact, IMPACT_FACTORS } from "../src/lib/impact";

describe("formatters", () => {
  it("formats dates like the reference screens", () => {
    const ts = new Date(2024, 5, 10, 14, 0).getTime();
    expect(formatDate(ts)).toBe("10 Jun 2024");
    expect(formatDateTime(ts)).toBe("10 Jun 2024 14:00");
  });

  it("formats mass with tonne rollover", () => {
    expect(formatKg(3.25)).toBe("3.3 kg");
    expect(formatKg(1250)).toBe("1.3 t");
  });

  it("formats percentages from fractions and from 0–100 values", () => {
    expect(formatPct(0.125)).toBe("12.5%");
    expect(formatPct(64, { of100: true })).toBe("64%");
  });

  it("formats relative time buckets", () => {
    const now = 1_000_000_000_000;
    expect(formatTimeAgo(now - 30_000, now)).toBe("just now");
    expect(formatTimeAgo(now - 5 * 60_000, now)).toBe("5m ago");
    expect(formatTimeAgo(now - 3 * 3_600_000, now)).toBe("3h ago");
    expect(formatTimeAgo(now - 2 * 86_400_000, now)).toBe("2d ago");
  });

  it("truncates hashes with a tooltip-friendly ellipsis", () => {
    expect(truncateHash("abcdef0123456789")).toBe("abcdef0123…");
    expect(truncateHash("short")).toBe("short");
  });
});

describe("impact", () => {
  it("scales linearly with weight", () => {
    const one = computeImpact(1);
    const ten = computeImpact(10);
    expect(one.avoidedCo2eKg).toBeCloseTo(IMPACT_FACTORS.avoidedCo2ePerKg);
    expect(ten.avoidedCo2eKg).toBeCloseTo(one.avoidedCo2eKg * 10);
    expect(ten.materials[0]!.kg).toBeCloseTo(one.materials[0]!.kg * 10);
  });
});
