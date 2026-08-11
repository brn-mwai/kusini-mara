import { describe, expect, it } from "vitest";
import { dryRun, guessColumn, parseCsv } from "../src/lib/csv";

describe("parseCsv", () => {
  it("parses simple rows and trailing newlines", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles quoted fields, embedded commas, escaped quotes and CRLF", () => {
    expect(parseCsv('tag,"note, long"\r\n"RVL-1","says ""hi"""\r\n')).toEqual([
      ["tag", "note, long"],
      ["RVL-1", 'says "hi"'],
    ]);
  });

  it("handles newlines inside quoted fields", () => {
    expect(parseCsv('a\n"line1\nline2"')).toEqual([["a"], ["line1\nline2"]]);
  });
});

describe("guessColumn", () => {
  it("finds columns by fuzzy header name", () => {
    const headers = ["Serial No", "Chemistry", "Weight (kg)", "kWh"];
    expect(guessColumn(headers, ["tag", "serial"])).toBe(0);
    expect(guessColumn(headers, ["chem"])).toBe(1);
    expect(guessColumn(headers, ["mass", "weight"])).toBe(2);
    expect(guessColumn(headers, ["missing"])).toBeNull();
  });
});

describe("dryRun", () => {
  const row = (tag: string, chemistry: string, massKg: string, cap = "") => ({
    line: 2,
    tag,
    chemistry,
    massKg,
    capacityKwh: cap,
  });

  it("accepts valid rows and normalises chemistry aliases", () => {
    const out = dryRun([row("rvl-9", "lead-acid", "12.5")], new Set());
    expect(out[0]).toMatchObject({
      ok: true,
      tag: "RVL-9",
      chemistry: "lead_acid",
      massKg: 12.5,
    });
  });

  it("rejects duplicates within the file and against the registry", () => {
    const out = dryRun(
      [row("A", "LFP", "1"), row("A", "LFP", "1"), row("B", "LFP", "1")],
      new Set(["B"]),
    );
    expect(out.map((r) => r.ok)).toEqual([true, false, false]);
    expect(out[1]!.reason).toMatch(/duplicate/i);
    expect(out[2]!.reason).toMatch(/already registered/i);
  });

  it("rejects bad chemistry, bad mass and bad capacity with reasons", () => {
    const out = dryRun(
      [
        row("A", "unobtainium", "1"),
        row("B", "NMC", "-2"),
        row("C", "NMC", "1", "zero"),
        row("", "NMC", "1"),
      ],
      new Set(),
    );
    expect(out.map((r) => r.ok)).toEqual([false, false, false, false]);
    expect(out[0]!.reason).toMatch(/chemistry/i);
    expect(out[1]!.reason).toMatch(/mass/i);
    expect(out[2]!.reason).toMatch(/capacity/i);
    expect(out[3]!.reason).toMatch(/tag/i);
  });
});
