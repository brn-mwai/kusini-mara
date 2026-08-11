// Formatting helpers. Anything rendered in DM Mono flows through here.

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(ts)} ${hh}:${mm}`;
}

export function formatTimeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(ts);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

export function formatKg(kg: number): string {
  if (kg >= 1000)
    return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(kg / 1000)} t`;
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(kg)} kg`;
}

export function formatKwh(kwh: number): string {
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(kwh)} kWh`;
}

export function formatPct(fraction01orPct: number, opts?: { of100?: boolean }): string {
  const pct = opts?.of100 ? fraction01orPct : fraction01orPct * 100;
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(pct)}%`;
}

export function formatKes(amount: number): string {
  return `KES ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function truncateHash(hash: string, chars = 10): string {
  if (hash.length <= chars + 2) return hash;
  return `${hash.slice(0, chars)}…`;
}

// ── domain labels ────────────────────────────────────────────────────────────

export const STAGE_LABEL: Record<string, string> = {
  registered: "Registered",
  with_producer: "With producer",
  in_transit: "In transit",
  at_facility: "At facility",
  graded: "Graded",
  allocated: "Allocated",
  second_life: "Second life",
  recycled: "Recycled",
  quarantined: "Quarantined",
};

export const GRADE_LABEL: Record<string, string> = {
  reusable: "Reusable",
  repairable: "Repairable",
  recycle: "Recycle",
  hazardous: "Hazardous",
  ungraded: "Ungraded",
};

export const CHEMISTRY_LABEL: Record<string, string> = {
  LFP: "LFP",
  NMC: "NMC",
  NCA: "NCA",
  LCO: "LCO",
  LMO: "LMO",
  NiMH: "NiMH",
  lead_acid: "Lead-acid",
};

export const EVENT_LABEL: Record<string, string> = {
  register: "Registered",
  handover: "Handover",
  pickup: "Pickup",
  arrival: "Arrival",
  weigh: "Weigh",
  temp_check: "Temperature check",
  deliver: "Delivered",
  grade: "Graded",
  quarantine: "Quarantined",
  release: "Released",
  allocate: "Allocated",
  disposition: "Disposition",
  triage: "Field triage",
};

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const GRADE_TONE: Record<string, Tone> = {
  reusable: "success",
  repairable: "info",
  recycle: "warning",
  hazardous: "danger",
  ungraded: "neutral",
};

export const STAGE_TONE: Record<string, Tone> = {
  registered: "neutral",
  with_producer: "neutral",
  in_transit: "info",
  at_facility: "info",
  graded: "success",
  allocated: "brand",
  second_life: "success",
  recycled: "success",
  quarantined: "danger",
};

export const PERMIT_TONE: Record<string, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const ORG_STATUS_TONE: Record<string, Tone> = {
  active: "success",
  pending: "warning",
  suspended: "danger",
};

export const COLLECTION_TONE: Record<string, Tone> = {
  scheduled: "neutral",
  en_route: "info",
  arrived: "warning",
  collected: "success",
  refused: "danger",
  cancelled: "neutral",
};
