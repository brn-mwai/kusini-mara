// The symmetric handshake: whoever posts a movement assigns the other side; the
// assigned side acknowledges and sets the pickup time. These helpers resolve
// sides and derived times consistently across queries and mutations.
import type { Doc } from "../_generated/dataModel";
import type { Infer } from "convex/values";
import { partySide, transportMode } from "../schema";

export type PartySide = Infer<typeof partySide>;
type TransportMode = Infer<typeof transportMode>;

const AIR_MODES: TransportMode[] = ["charter", "scheduled", "helicopter", "self_fly"];

export function isAirMode(mode: TransportMode): boolean {
  return AIR_MODES.includes(mode);
}

// Default assignment when the poster doesn't choose explicitly. Air movements
// have a strip party: an arrival is acknowledged at the strip, a departure by
// the lodge that must deliver the guests. Ground modes have no strip side —
// the lodge self-manages them.
export function defaultAssignedSide(
  mode: TransportMode,
  direction: "arrival" | "departure",
): PartySide {
  if (!isAirMode(mode)) return "lodge";
  return direction === "arrival" ? "airstrip" : "lodge";
}

// Legacy rows (pre-handshake) were always acknowledged by the lodge.
export function assignedSide(a: Doc<"arrivalEvents">): PartySide {
  return a.assignedToSide ?? "lodge";
}

// The time the vehicle meets the guests: confirmed wins, then the poster's
// proposal, then the movement time itself.
export function effectivePickupTime(a: Doc<"arrivalEvents">): number {
  return a.confirmedPickupTime ?? a.proposedPickupTime ?? a.scheduledTime;
}

// Derived, never stored: "guests at the strip N minutes early."
export function guestReportTime(
  a: Doc<"arrivalEvents">,
  fallbackOffsetMinutes = 30,
): number {
  const offset = a.guestReportOffsetMinutes ?? fallbackOffsetMinutes;
  return effectivePickupTime(a) - offset * 60_000;
}

// Operational time display, evidence style: 11h25 (Africa/Nairobi for the pilot).
export function hhmm(ms: number, timeZone = "Africa/Nairobi"): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(ms));
  return parts.replace(":", "h");
}

export const ACKABLE_STATUSES = ["scheduled", "reconfirm_required", "escalated"] as const;

export function isAckable(a: Doc<"arrivalEvents">): boolean {
  return (
    (ACKABLE_STATUSES as readonly string[]).includes(a.status) ||
    (a.status === "acknowledged" && a.reconfirmRequested)
  );
}
