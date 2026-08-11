import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { chemistryV, gradeV, stageV } from "./schema";
import { requirePartner, requireProducer, requireStaff } from "./lib/auth";
import {
  containersById,
  dayBuckets,
  DAY_MS,
  orgNames,
  startOfDay,
} from "./lib/joins";
import { appendBatteryEvent } from "./model/custody";
import { assembleTrail } from "./trail";

// ── control tower ────────────────────────────────────────────────────────────

export const registry = query({
  args: {
    stage: v.optional(stageV),
    grade: v.optional(gradeV),
    chemistry: v.optional(chemistryV),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const names = await orgNames(ctx);
    const containers = await containersById(ctx);
    let rows = await ctx.db.query("batteries").collect();
    if (args.stage) rows = rows.filter((b) => b.stage === args.stage);
    if (args.grade) rows = rows.filter((b) => b.grade === args.grade);
    if (args.chemistry)
      rows = rows.filter((b) => b.chemistry === args.chemistry);
    rows.sort((a, b) => b.lastEventAt - a.lastEventAt);
    return rows.map((b) => ({
      _id: b._id,
      tag: b.tag,
      publicToken: b.publicToken,
      chemistry: b.chemistry,
      massKg: b.massKg,
      stateOfHealthPct: b.stateOfHealthPct,
      grade: b.grade,
      stage: b.stage,
      quarantined: b.quarantined,
      producer: names.get(b.producerOrgId) ?? "—",
      container: b.containerId
        ? (containers.get(b.containerId)?.tag ?? null)
        : null,
      lastEventAt: b.lastEventAt,
    }));
  },
});

export const registrySummary = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireStaff(ctx);
    const now = Date.now();
    const batteries = await ctx.db.query("batteries").collect();
    const containers = await ctx.db.query("containers").collect();
    const points = await ctx.db.query("points").collect();
    const collections = await ctx.db.query("collections").collect();
    const settings = await ctx.db.query("settings").collect();
    const setting = (key: string) =>
      settings.find((s) => s.key === key)?.value ?? null;

    const inCustody = batteries.filter((b) => b.custodianOrgId === org._id);
    const conditionSplit = {
      reusable: 0,
      repairable: 0,
      recycle: 0,
      hazardous: 0,
      ungraded: 0,
    };
    for (const b of batteries) conditionSplit[b.grade]++;

    const days = dayBuckets(now, 14);
    const collected = collections.filter(
      (c) => c.status === "collected" && c.completedAt !== undefined,
    );
    const collectionsPerDay = days.map((day) => ({
      day,
      count: collected.filter(
        (c) => startOfDay(c.completedAt!) === day,
      ).length,
    }));

    const activePoints = points.filter((p) => p.active);
    const last30 = collected.filter((c) => c.completedAt! >= now - 30 * DAY_MS);
    const kgLast30 = last30.reduce((s, c) => s + (c.collectedMassKg ?? 0), 0);
    const costPerStop = setting("servicing_cost_per_stop_kes");
    const facilityUnits = batteries.filter(
      (b) => b.stage !== "registered" && b.stage !== "with_producer",
    );
    const contaminated = facilityUnits.filter(
      (b) => b.quarantined || b.grade === "hazardous",
    );

    return {
      totalOnRegistry: batteries.length,
      massInCustodyKg: inCustody.reduce((s, b) => s + b.massKg, 0),
      containersDeployed: containers.filter((c) => c.stage === "deployed")
        .length,
      awaitingGrading: batteries.filter(
        (b) => b.stage === "at_facility" && b.grade === "ungraded",
      ).length,
      quarantined: batteries.filter((b) => b.quarantined).length,
      conditionSplit,
      collectionsPerDay,
      pilot: {
        kgPerPointPerMonth:
          activePoints.length > 0 ? kgLast30 / activePoints.length : null,
        servicingCostPerPointKes:
          costPerStop !== null && activePoints.length > 0
            ? (costPerStop * last30.length) / activePoints.length
            : null,
        contaminationRate:
          facilityUnits.length > 0
            ? contaminated.length / facilityUnits.length
            : null,
      },
    };
  },
});

// ── producer console ─────────────────────────────────────────────────────────

export const myBatteries = query({
  args: {
    stage: v.optional(stageV),
    grade: v.optional(gradeV),
  },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    const containers = await containersById(ctx);
    let rows = await ctx.db
      .query("batteries")
      .withIndex("by_producer", (q) => q.eq("producerOrgId", org._id))
      .collect();
    if (args.stage) rows = rows.filter((b) => b.stage === args.stage);
    if (args.grade) rows = rows.filter((b) => b.grade === args.grade);
    rows.sort((a, b) => b.lastEventAt - a.lastEventAt);
    return rows.map((b) => ({
      _id: b._id,
      tag: b.tag,
      publicToken: b.publicToken,
      chemistry: b.chemistry,
      massKg: b.massKg,
      grade: b.grade,
      stage: b.stage,
      container: b.containerId
        ? (containers.get(b.containerId)?.tag ?? null)
        : null,
      lastEventAt: b.lastEventAt,
    }));
  },
});

export const producerSummary = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireProducer(ctx);
    const now = Date.now();
    const mine = await ctx.db
      .query("batteries")
      .withIndex("by_producer", (q) => q.eq("producerOrgId", org._id))
      .collect();
    const containers = await ctx.db
      .query("containers")
      .withIndex("by_custodian", (q) => q.eq("custodianOrgId", org._id))
      .collect();

    const handedOver = mine.filter(
      (b) => b.stage !== "registered" && b.stage !== "with_producer",
    );
    const conditionSplit = {
      reusable: 0,
      repairable: 0,
      recycle: 0,
      hazardous: 0,
      ungraded: 0,
    };
    for (const b of mine) conditionSplit[b.grade]++;

    // Cumulative mass diverted, by day of departure from producer custody.
    const events = await ctx.db.query("custodyEvents").collect();
    const departures = events
      .filter((e) => e.type === "pickup" && e.fromOrgId === org._id)
      .sort((a, b) => a.at - b.at);
    const days = dayBuckets(now, 30);
    let running = 0;
    let di = 0;
    const massOverTime = days.map((day) => {
      while (di < departures.length && startOfDay(departures[di]!.at) <= day) {
        running += departures[di]!.massKg ?? 0;
        di++;
      }
      return { day, cumulativeKg: running };
    });

    return {
      handedOver: handedOver.length,
      massDivertedKg: handedOver.reduce((s, b) => s + b.massKg, 0),
      containersOnSite: containers.filter((c) => c.stage === "deployed").length,
      gradedReusable: mine.filter((b) => b.grade === "reusable").length,
      awaitingGrading: mine.filter(
        (b) => b.stage === "at_facility" && b.grade === "ungraded",
      ).length,
      conditionSplit,
      massOverTime,
    };
  },
});

// ── partner console ──────────────────────────────────────────────────────────

const offtakeFilter = (b: {
  stage: string;
  grade: string;
  quarantined: boolean;
}) =>
  !b.quarantined &&
  (b.stage === "graded" || b.stage === "allocated") &&
  b.grade !== "ungraded" &&
  b.grade !== "hazardous";

export const availableForOfftake = query({
  args: {
    minSohPct: v.optional(v.number()),
    chemistry: v.optional(chemistryV),
  },
  handler: async (ctx, args) => {
    const { org } = await requirePartner(ctx);
    const all = await ctx.db.query("batteries").collect();
    const interests = await ctx.db
      .query("interests")
      .withIndex("by_partner", (q) => q.eq("partnerOrgId", org._id))
      .collect();
    const mine = new Map(interests.map((i) => [i.batteryId, i.status]));
    let rows = all.filter(offtakeFilter);
    if (args.chemistry !== undefined)
      rows = rows.filter((b) => b.chemistry === args.chemistry);
    if (args.minSohPct !== undefined) {
      const min = args.minSohPct;
      rows = rows.filter((b) => (b.stateOfHealthPct ?? 0) >= min);
    }
    rows.sort(
      (a, b) => (b.stateOfHealthPct ?? -1) - (a.stateOfHealthPct ?? -1),
    );
    return rows.map((b) => ({
      _id: b._id,
      tag: b.tag,
      chemistry: b.chemistry,
      massKg: b.massKg,
      capacityKwh: b.capacityKwh,
      stateOfHealthPct: b.stateOfHealthPct,
      cycleCount: b.cycleCount,
      remainingCycles: b.remainingCycles,
      grade: b.grade,
      stage: b.stage,
      dismantlingNotes: b.dismantlingNotes,
      interestStatus: mine.get(b._id) ?? null,
      lastEventAt: b.lastEventAt,
    }));
  },
});

export const offtakeSummary = query({
  args: {},
  handler: async (ctx) => {
    await requirePartner(ctx);
    const all = (await ctx.db.query("batteries").collect()).filter(
      offtakeFilter,
    );
    const byChemistry: Record<string, number> = {};
    for (const b of all)
      byChemistry[b.chemistry] = (byChemistry[b.chemistry] ?? 0) + b.massKg;
    return {
      unitsAvailable: all.length,
      gradedReusable: all.filter((b) => b.grade === "reusable").length,
      forMaterialRecovery: all.filter((b) => b.grade === "recycle").length,
      totalMassKg: all.reduce((s, b) => s + b.massKg, 0),
      secondLifeKwh: all
        .filter((b) => b.grade === "reusable")
        .reduce((s, b) => s + (b.capacityKwh ?? 0), 0),
      chemistryMixKg: byChemistry,
    };
  },
});

// ── trail (producer view of one of their own units) ──────────────────────────

export const batteryTrail = query({
  args: { batteryId: v.id("batteries") },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery || battery.producerOrgId !== org._id) return null;
    return assembleTrail(ctx, args.batteryId);
  },
});

// ── staff actions ────────────────────────────────────────────────────────────

export const gradeBattery = mutation({
  args: {
    batteryId: v.id("batteries"),
    grade: gradeV,
    stateOfHealthPct: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    if (battery.quarantined)
      throw new Error("Quarantined unit — release it before grading");
    if (args.grade === "ungraded") throw new Error("Pick a grade");
    await ctx.db.patch(args.batteryId, {
      grade: args.grade,
      stage: args.grade === "hazardous" ? "quarantined" : "graded",
      quarantined: args.grade === "hazardous",
      quarantineReason:
        args.grade === "hazardous" ? "Graded hazardous" : undefined,
      stateOfHealthPct: args.stateOfHealthPct ?? battery.stateOfHealthPct,
    });
    await appendBatteryEvent(ctx, {
      at: Date.now(),
      type: "grade",
      batteryId: args.batteryId,
      actorOrgId: org._id,
      note: args.note
        ? `Graded ${args.grade} — ${args.note}`
        : `Graded ${args.grade}`,
    });
  },
});

export const quarantineBattery = mutation({
  args: { batteryId: v.id("batteries"), reason: v.string() },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    if (battery.quarantined) throw new Error("Already quarantined");
    await ctx.db.patch(args.batteryId, {
      quarantined: true,
      quarantineReason: args.reason,
      stage: "quarantined",
    });
    await appendBatteryEvent(ctx, {
      at: Date.now(),
      type: "quarantine",
      batteryId: args.batteryId,
      actorOrgId: org._id,
      note: args.reason,
    });
  },
});

export const releaseBattery = mutation({
  args: { batteryId: v.id("batteries"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    if (!battery.quarantined) throw new Error("Not quarantined");
    await ctx.db.patch(args.batteryId, {
      quarantined: false,
      quarantineReason: undefined,
      stage: battery.grade === "ungraded" ? "at_facility" : "graded",
    });
    await appendBatteryEvent(ctx, {
      at: Date.now(),
      type: "release",
      batteryId: args.batteryId,
      actorOrgId: org._id,
      note: args.note,
    });
  },
});

// Field triage: one-way quarantine with a named condition.
export const triageQuarantine = mutation({
  args: {
    batteryId: v.id("batteries"),
    condition: v.union(
      v.literal("leaking"),
      v.literal("swollen"),
      v.literal("thermal"),
    ),
  },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    const label = {
      leaking: "Leaking",
      swollen: "Swollen",
      thermal: "Thermal damage",
    }[args.condition];
    await ctx.db.patch(args.batteryId, {
      quarantined: true,
      quarantineReason: label,
      grade: "hazardous",
      stage: "quarantined",
    });
    await appendBatteryEvent(ctx, {
      at: Date.now(),
      type: "triage",
      batteryId: args.batteryId,
      actorOrgId: org._id,
      note: label,
    });
  },
});
