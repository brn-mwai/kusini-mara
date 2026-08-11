import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireProducer, requireStaff } from "./lib/auth";
import { pointsById } from "./lib/joins";

export const myContainers = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireProducer(ctx);
    const points = await pointsById(ctx);
    const rows = await ctx.db
      .query("containers")
      .withIndex("by_custodian", (q) => q.eq("custodianOrgId", org._id))
      .collect();
    return rows.map((c) => ({
      _id: c._id,
      tag: c.tag,
      stage: c.stage,
      fillPct: c.fillPct,
      capacityKg: c.capacityKg,
      currentMassKg: c.currentMassKg,
      lastTempCheckAt: c.lastTempCheckAt ?? null,
      lastTempC: c.lastTempC ?? null,
      site: c.pointId ? (points.get(c.pointId)?.name ?? null) : null,
    }));
  },
});

export const containerRegister = query({
  args: { stage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const points = await pointsById(ctx);
    let rows = await ctx.db.query("containers").collect();
    if (args.stage) rows = rows.filter((c) => c.stage === args.stage);
    rows.sort((a, b) => b.fillPct - a.fillPct);
    return rows.map((c) => ({
      _id: c._id,
      tag: c.tag,
      publicToken: c.publicToken,
      stage: c.stage,
      fillPct: c.fillPct,
      capacityKg: c.capacityKg,
      currentMassKg: c.currentMassKg,
      lastTempCheckAt: c.lastTempCheckAt ?? null,
      lastTempC: c.lastTempC ?? null,
      labelState: c.labelState,
      site: c.pointId ? (points.get(c.pointId)?.name ?? null) : null,
      lat: c.lat ?? null,
      lng: c.lng ?? null,
    }));
  },
});
