// Minimal CSV parsing for producer onboarding. Handles quoted fields,
// escaped quotes, CRLF, and trailing newlines. Tested in tests/csv.test.ts.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      pushField();
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      pushRow();
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) pushRow();
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export const CHEMISTRIES = [
  "LFP",
  "NMC",
  "NCA",
  "LCO",
  "LMO",
  "NiMH",
  "lead_acid",
] as const;
export type Chemistry = (typeof CHEMISTRIES)[number];

export type MappedRow = {
  line: number;
  tag: string;
  chemistry: string;
  massKg: string;
  capacityKwh: string;
};

export type DryRunRow = {
  line: number;
  tag: string;
  chemistry: Chemistry | null;
  massKg: number | null;
  capacityKwh: number | undefined;
  ok: boolean;
  reason: string | null;
};

function normaliseChemistry(raw: string): Chemistry | null {
  const cleaned = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const hit = CHEMISTRIES.find((c) => c.toLowerCase() === cleaned);
  return hit ?? null;
}

/** Client-side dry run: what will be created, what will be rejected, and why. */
export function dryRun(
  rows: MappedRow[],
  existingTags: ReadonlySet<string>,
): DryRunRow[] {
  const seen = new Set<string>();
  return rows.map((r) => {
    const tag = r.tag.trim().toUpperCase();
    const chemistry = normaliseChemistry(r.chemistry);
    const mass = Number(r.massKg);
    const capRaw = r.capacityKwh.trim();
    const cap = capRaw === "" ? undefined : Number(capRaw);
    let reason: string | null = null;
    if (tag === "") reason = "Missing tag";
    else if (seen.has(tag)) reason = "Duplicate tag in file";
    else if (existingTags.has(tag)) reason = "Tag already registered";
    else if (chemistry === null) reason = `Unknown chemistry “${r.chemistry.trim()}”`;
    else if (!Number.isFinite(mass) || mass <= 0)
      reason = "Mass must be a positive number";
    else if (cap !== undefined && (!Number.isFinite(cap) || cap <= 0))
      reason = "Capacity must be a positive number when present";
    if (tag !== "") seen.add(tag);
    return {
      line: r.line,
      tag,
      chemistry,
      massKg: Number.isFinite(mass) && mass > 0 ? mass : null,
      capacityKwh:
        cap !== undefined && Number.isFinite(cap) && cap > 0 ? cap : undefined,
      ok: reason === null,
      reason,
    };
  });
}

/** Guess a column index for a field from its header name. */
export function guessColumn(
  headers: string[],
  candidates: string[],
): number | null {
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const cand of candidates) {
    const idx = lower.findIndex((h) => h.includes(cand));
    if (idx !== -1) return idx;
  }
  return null;
}
