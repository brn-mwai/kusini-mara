import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { chemistryV } from "./schema";
import { requireProducer, requireStaff } from "./lib/auth";
import { orgNames } from "./lib/joins";
import { appendBatteryEvent, appendCustodyEvent } from "./model/custody";
import { sha256Hex } from "./lib/sha256";

const CHEMISTRY_CLASS: Record<string, string> = {
  LFP: "Lithium-ion",
  NMC: "Lithium-ion",
  NCA: "Lithium-ion",
  LCO: "Lithium-ion",
  LMO: "Lithium-ion",
  NiMH: "Nickel-based",
  lead_acid: "Lead-based",
};

const PUBLIC_EVENT_LABEL: Record<string, string> = {
  register: "Registered",
  handover: "Handed over for collection",
  pickup: "Collected",
  arrival: "Arrived at facility",
  weigh: "Checked in",
  temp_check: "Safety check",
  deliver: "Delivered onward",
  grade: "Assessed",
  quarantine: "Held for safety",
  release: "Cleared",
  allocate: "Allocated",
  disposition: "Final disposition",
  triage: "Held for safety",
};

// ── public record (/q/[token]) ───────────────────────────────────────────────
// Deliberately narrow: no actor, no organisation, no address, no weights.
export const publicTrail = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const battery = await ctx.db
      .query("batteries")
      .withIndex("by_token", (q) => q.eq("publicToken", args.token))
      .unique();
    if (!battery) {
      // Container labels resolve to a container-shaped public record.
      const container = await ctx.db
        .query("containers")
        .withIndex("by_token", (q) => q.eq("publicToken", args.token))
        .unique();
      if (!container) return null;
      const events = (
        await ctx.db
          .query("custodyEvents")
          .withIndex("by_container", (q) => q.eq("containerId", container._id))
          .collect()
      )
        .sort((a, b) => a.at - b.at)
        .map((e) => ({
          at: e.at,
          label: PUBLIC_EVENT_LABEL[e.type] ?? "Movement",
        }));
      return {
        kind: "container" as const,
        tag: container.tag,
        stage: container.stage,
        events,
      };
    }
    const custody = await ctx.db
      .query("custodyEvents")
      .withIndex("by_battery", (q) => q.eq("batteryId", battery._id))
      .collect();
    const unit = await ctx.db
      .query("batteryEvents")
      .withIndex("by_battery", (q) => q.eq("batteryId", battery._id))
      .collect();
    const events = [...custody, ...unit]
      .sort((a, b) => a.at - b.at)
      .map((e) => ({
        at: e.at,
        label: PUBLIC_EVENT_LABEL[e.type] ?? "Movement",
      }));
    const disposition =
      battery.stage === "second_life"
        ? "Second life"
        : battery.stage === "recycled"
          ? "Material recovery"
          : null;
    return {
      kind: "battery" as const,
      tag: battery.tag,
      chemistryClass: CHEMISTRY_CLASS[battery.chemistry] ?? "Battery",
      stage: battery.stage,
      quarantined: battery.quarantined,
      events,
      disposition,
    };
  },
});

// ── staff registration ───────────────────────────────────────────────────────

export const registerForStaff = mutation({
  args: {
    tag: v.string(),
    chemistry: chemistryV,
    massKg: v.number(),
    capacityKwh: v.optional(v.number()),
    producerOrgId: v.id("orgs"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const existing = await ctx.db
      .query("batteries")
      .withIndex("by_tag", (q) => q.eq("tag", args.tag))
      .unique();
    if (existing) throw new Error(`Tag ${args.tag} is already registered`);
    const now = Date.now();
    const publicToken = sha256Hex(`${args.tag}|${now}`).slice(0, 12);
    const batteryId = await ctx.db.insert("batteries", {
      tag: args.tag,
      publicToken,
      chemistry: args.chemistry,
      massKg: args.massKg,
      capacityKwh: args.capacityKwh,
      grade: "ungraded",
      stage: "registered",
      producerOrgId: args.producerOrgId,
      custodianOrgId: args.producerOrgId,
      quarantined: false,
      lastEventAt: now,
      createdAt: now,
    });
    await appendBatteryEvent(ctx, {
      at: now,
      type: "register",
      batteryId,
      actorOrgId: org._id,
      note: args.note,
    });
    return { batteryId, publicToken };
  },
});

// Producer CSV onboarding: rows arrive already validated by the dry run;
// the mutation re-checks anyway and reports per-row outcomes.
export const onboardBatch = mutation({
  args: {
    rows: v.array(
      v.object({
        tag: v.string(),
        chemistry: chemistryV,
        massKg: v.number(),
        capacityKwh: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    if (args.rows.length > 500)
      throw new Error("Commit at most 500 units per batch");
    const now = Date.now();
    let created = 0;
    const rejected: { tag: string; reason: string }[] = [];
    for (const row of args.rows) {
      const existing = await ctx.db
        .query("batteries")
        .withIndex("by_tag", (q) => q.eq("tag", row.tag))
        .unique();
      if (existing) {
        rejected.push({ tag: row.tag, reason: "Tag already registered" });
        continue;
      }
      if (!(row.massKg > 0)) {
        rejected.push({ tag: row.tag, reason: "Mass must be positive" });
        continue;
      }
      const publicToken = sha256Hex(`${row.tag}|${now}|${created}`).slice(
        0,
        12,
      );
      const batteryId = await ctx.db.insert("batteries", {
        tag: row.tag,
        publicToken,
        chemistry: row.chemistry,
        massKg: row.massKg,
        capacityKwh: row.capacityKwh,
        grade: "ungraded",
        stage: "with_producer",
        producerOrgId: org._id,
        custodianOrgId: org._id,
        quarantined: false,
        lastEventAt: now,
        createdAt: now,
      });
      await appendBatteryEvent(ctx, {
        at: now,
        type: "register",
        batteryId,
        actorOrgId: org._id,
        note: "Onboarded via CSV",
      });
      created++;
    }
    return { created, rejected };
  },
});

// ── movement feed (/admin/movements) ─────────────────────────────────────────

export const movements = query({
  args: {
    scope: v.optional(
      v.union(v.literal("custody"), v.literal("battery"), v.literal("all")),
    ),
    type: v.optional(v.string()),
    subject: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const names = await orgNames(ctx);
    const scope = args.scope ?? "all";
    const limit = Math.min(args.limit ?? 200, 500);

    const batteries = await ctx.db.query("batteries").collect();
    const batteryById = new Map(batteries.map((b) => [b._id, b]));
    const containers = await ctx.db.query("containers").collect();
    const containerById = new Map(containers.map((c) => [c._id, c]));

    type FeedRow = {
      key: string;
      scope: "custody" | "battery";
      at: number;
      type: string;
      subject: string;
      actor: string | null;
      note: string | null;
      hash: string;
    };
    const rows: FeedRow[] = [];

    if (scope !== "battery") {
      const custody = await ctx.db.query("custodyEvents").collect();
      for (const e of custody) {
        const subject = e.batteryId
          ? (batteryById.get(e.batteryId)?.tag ?? "unit")
          : e.containerId
            ? (containerById.get(e.containerId)?.tag ?? "container")
            : "—";
        rows.push({
          key: `c:${e._id}`,
          scope: "custody",
          at: e.at,
          type: e.type,
          subject,
          actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
          note: e.note ?? null,
          hash: e.hash,
        });
      }
    }
    if (scope !== "custody") {
      const unit = await ctx.db.query("batteryEvents").collect();
      for (const e of unit) {
        rows.push({
          key: `b:${e._id}`,
          scope: "battery",
          at: e.at,
          type: e.type,
          subject: batteryById.get(e.batteryId)?.tag ?? "unit",
          actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
          note: e.note ?? null,
          hash: e.hash,
        });
      }
    }

    let out = rows;
    if (args.type) out = out.filter((r) => r.type === args.type);
    if (args.subject) {
      const needle = args.subject.toLowerCase();
      out = out.filter((r) => r.subject.toLowerCase().includes(needle));
    }
    out.sort((a, b) => b.at - a.at);
    return out.slice(0, limit);
  },
});

// Producer-scoped feed: events touching the caller's own units only.
export const myMovements = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    const names = await orgNames(ctx);
    const limit = Math.min(args.limit ?? 50, 200);
    const mine = await ctx.db
      .query("batteries")
      .withIndex("by_producer", (q) => q.eq("producerOrgId", org._id))
      .collect();
    const tagById = new Map(mine.map((b) => [b._id, b.tag]));
    const custody = await ctx.db.query("custodyEvents").collect();
    const unit = await ctx.db.query("batteryEvents").collect();
    const rows = [
      ...custody
        .filter((e) => e.batteryId !== undefined && tagById.has(e.batteryId))
        .map((e) => ({
          key: `c:${e._id}`,
          scope: "custody" as const,
          at: e.at,
          type: e.type as string,
          subject: tagById.get(e.batteryId!) ?? "unit",
          actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
          note: e.note ?? null,
          hash: e.hash,
        })),
      ...unit
        .filter((e) => tagById.has(e.batteryId))
        .map((e) => ({
          key: `b:${e._id}`,
          scope: "battery" as const,
          at: e.at,
          type: e.type as string,
          subject: tagById.get(e.batteryId) ?? "unit",
          actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
          note: e.note ?? null,
          hash: e.hash,
        })),
    ];
    rows.sort((a, b) => b.at - a.at);
    return rows.slice(0, limit);
  },
});

// ── full trail for staff / producer panels ───────────────────────────────────

export async function assembleTrail(
  ctx: Parameters<typeof orgNames>[0],
  batteryId: import("./_generated/dataModel").Id<"batteries">,
) {
  const battery = await ctx.db.get(batteryId);
  if (!battery) return null;
  const names = await orgNames(ctx);
  const custody = await ctx.db
    .query("custodyEvents")
    .withIndex("by_battery", (q) => q.eq("batteryId", batteryId))
    .collect();
  const unit = await ctx.db
    .query("batteryEvents")
    .withIndex("by_battery", (q) => q.eq("batteryId", batteryId))
    .collect();
  const events = [
    ...custody.map((e) => ({
      scope: "custody" as const,
      at: e.at,
      type: e.type,
      actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
      note: e.note ?? null,
      massKg: e.massKg ?? null,
      hash: e.hash,
    })),
    ...unit.map((e) => ({
      scope: "battery" as const,
      at: e.at,
      type: e.type,
      actor: e.actorOrgId ? (names.get(e.actorOrgId) ?? null) : null,
      note: e.note ?? null,
      massKg: null,
      hash: e.hash,
    })),
  ].sort((a, b) => a.at - b.at);

  // Anchor receipt: the confirmed anchor whose period covers the last event.
  const anchorsAll = await ctx.db.query("anchors").collect();
  const lastAt = events.length > 0 ? events[events.length - 1]!.at : null;
  const anchor =
    lastAt === null
      ? null
      : (anchorsAll
          .filter((a) => a.periodStart <= lastAt && lastAt < a.periodEnd)
          .sort((a, b) => b.periodStart - a.periodStart)[0] ?? null);

  return {
    battery: {
      _id: battery._id,
      tag: battery.tag,
      publicToken: battery.publicToken,
      chemistry: battery.chemistry,
      massKg: battery.massKg,
      capacityKwh: battery.capacityKwh ?? null,
      stateOfHealthPct: battery.stateOfHealthPct ?? null,
      cycleCount: battery.cycleCount ?? null,
      remainingCycles: battery.remainingCycles ?? null,
      grade: battery.grade,
      stage: battery.stage,
      quarantined: battery.quarantined,
      quarantineReason: battery.quarantineReason ?? null,
      dismantlingNotes: battery.dismantlingNotes ?? null,
      producer: names.get(battery.producerOrgId) ?? "—",
    },
    events,
    anchor: anchor
      ? {
          merkleRoot: anchor.merkleRoot,
          provider: anchor.provider,
          txId: anchor.txId ?? null,
          state: anchor.state,
          periodStart: anchor.periodStart,
          periodEnd: anchor.periodEnd,
        }
      : null,
  };
}

export const trailForStaff = query({
  args: { batteryId: v.id("batteries") },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    return assembleTrail(ctx, args.batteryId);
  },
});

// Field scan: resolve a tag to the unit and its last known state.
export const scanLookup = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const battery = await ctx.db
      .query("batteries")
      .withIndex("by_tag", (q) => q.eq("tag", args.tag))
      .unique();
    if (!battery) return null;
    const names = await orgNames(ctx);
    return {
      _id: battery._id,
      tag: battery.tag,
      chemistry: battery.chemistry,
      expectedMassKg: battery.massKg,
      grade: battery.grade,
      stage: battery.stage,
      quarantined: battery.quarantined,
      custodian: battery.custodianOrgId
        ? (names.get(battery.custodianOrgId) ?? null)
        : null,
      lastEventAt: battery.lastEventAt,
    };
  },
});

// Field scan: swipe-to-confirm takes custody of a scanned unit.
export const signForCustody = mutation({
  args: { batteryId: v.id("batteries") },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    if (battery.custodianOrgId === org._id)
      throw new Error("Already in your custody");
    const now = Date.now();
    await ctx.db.patch(args.batteryId, {
      custodianOrgId: org._id,
      stage: "in_transit",
    });
    await appendCustodyEvent(ctx, {
      at: now,
      type: "pickup",
      batteryId: args.batteryId,
      actorOrgId: org._id,
      fromOrgId: battery.custodianOrgId,
      toOrgId: org._id,
      massKg: battery.massKg,
      note: "Signed for custody in the field",
    });
  },
});
