// ─────────────────────────────────────────────────────────────────────────────
// The ONLY writer of `custodyEvents` and `batteryEvents`. Each table is an
// append-only chain: every event carries the hash of its predecessor and its
// own hash over a canonical serialisation, so a period of events can later be
// anchored under a Merkle root. Nothing outside this module may insert, patch
// or delete rows in either table.
// ─────────────────────────────────────────────────────────────────────────────
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { sha256Hex } from "../lib/sha256";

export const GENESIS_HASH = "0".repeat(64);

type CustodyEventInput = {
  at: number;
  type: Doc<"custodyEvents">["type"];
  batteryId?: Id<"batteries">;
  containerId?: Id<"containers">;
  actorOrgId?: Id<"orgs">;
  fromOrgId?: Id<"orgs">;
  toOrgId?: Id<"orgs">;
  massKg?: number;
  note?: string;
};

type BatteryEventInput = {
  at: number;
  type: Doc<"batteryEvents">["type"];
  batteryId: Id<"batteries">;
  actorOrgId?: Id<"orgs">;
  note?: string;
};

/** Canonical serialisation: fixed field order, empty string for absent. */
export function custodyEventPayload(
  seq: number,
  ev: CustodyEventInput,
  prevHash: string,
): string {
  return [
    seq,
    ev.at,
    ev.type,
    ev.batteryId ?? "",
    ev.containerId ?? "",
    ev.actorOrgId ?? "",
    ev.fromOrgId ?? "",
    ev.toOrgId ?? "",
    ev.massKg ?? "",
    ev.note ?? "",
    prevHash,
  ].join("|");
}

export function batteryEventPayload(
  seq: number,
  ev: BatteryEventInput,
  prevHash: string,
): string {
  return [
    seq,
    ev.at,
    ev.type,
    ev.batteryId,
    ev.actorOrgId ?? "",
    ev.note ?? "",
    prevHash,
  ].join("|");
}

async function chainHead(
  ctx: MutationCtx,
  table: "custodyEvents" | "batteryEvents",
): Promise<{ seq: number; hash: string }> {
  const last = await ctx.db
    .query(table)
    .withIndex("by_seq")
    .order("desc")
    .first();
  return last
    ? { seq: last.seq + 1, hash: last.hash }
    : { seq: 0, hash: GENESIS_HASH };
}

export async function appendCustodyEvent(
  ctx: MutationCtx,
  ev: CustodyEventInput,
): Promise<Doc<"custodyEvents">> {
  const head = await chainHead(ctx, "custodyEvents");
  const hash = sha256Hex(custodyEventPayload(head.seq, ev, head.hash));
  const id = await ctx.db.insert("custodyEvents", {
    seq: head.seq,
    prevHash: head.hash,
    hash,
    ...ev,
  });
  if (ev.batteryId) {
    await ctx.db.patch(ev.batteryId, { lastEventAt: ev.at });
  }
  return (await ctx.db.get(id))!;
}

export async function appendBatteryEvent(
  ctx: MutationCtx,
  ev: BatteryEventInput,
): Promise<Doc<"batteryEvents">> {
  const head = await chainHead(ctx, "batteryEvents");
  const hash = sha256Hex(batteryEventPayload(head.seq, ev, head.hash));
  const id = await ctx.db.insert("batteryEvents", {
    seq: head.seq,
    prevHash: head.hash,
    hash,
    ...ev,
  });
  await ctx.db.patch(ev.batteryId, { lastEventAt: ev.at });
  return (await ctx.db.get(id))!;
}

/** Merkle root over an ordered list of event hashes (pairwise sha256). */
export function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return GENESIS_HASH;
  let level = hashes;
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]!;
      const right = level[i + 1] ?? left;
      next.push(sha256Hex(left + right));
    }
    level = next;
  }
  return level[0]!;
}
