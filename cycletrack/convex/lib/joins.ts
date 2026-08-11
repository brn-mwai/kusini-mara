import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

// Seed-scale datasets: whole-table maps keep the join code short and readable.

export async function orgNames(
  ctx: QueryCtx,
): Promise<Map<Id<"orgs">, string>> {
  const all = await ctx.db.query("orgs").collect();
  return new Map(all.map((o) => [o._id, o.name]));
}

export async function pointsById(
  ctx: QueryCtx,
): Promise<Map<Id<"points">, Doc<"points">>> {
  const all = await ctx.db.query("points").collect();
  return new Map(all.map((p) => [p._id, p]));
}

export async function containersById(
  ctx: QueryCtx,
): Promise<Map<Id<"containers">, Doc<"containers">>> {
  const all = await ctx.db.query("containers").collect();
  return new Map(all.map((c) => [c._id, c]));
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(ts: number): number {
  return Math.floor(ts / DAY_MS) * DAY_MS;
}

/** `days` buckets ending today: [{ day, ...zero }] keyed oldest → newest. */
export function dayBuckets(now: number, days: number): number[] {
  const today = startOfDay(now);
  return Array.from({ length: days }, (_, i) => today - (days - 1 - i) * DAY_MS);
}
