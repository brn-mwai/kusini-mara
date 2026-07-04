import { ulid } from "./ids";

// Row builders enforcing the portable-key convention (KUSINI-SCHEMA.md §1).
// withStamps: tables carrying createdAt/updatedAt/archivedAt.
// withId: tables that carry only the portable id (append-only logs, join rows).
export function withStamps<T extends object>(fields: T, now: number = Date.now()) {
  return { id: ulid(now), createdAt: now, updatedAt: now, ...fields };
}
export function withId<T extends object>(fields: T, now: number = Date.now()) {
  return { id: ulid(now), ...fields };
}

// Statuses that still need a lodge acknowledgment (drives unacked-first sort).
export const NEEDS_ACK: readonly string[] = [
  "posted",
  "scheduled",
  "reconfirm_required",
];
