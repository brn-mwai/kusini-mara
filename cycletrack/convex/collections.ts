import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireProducer, requireStaff } from "./lib/auth";
import { containersById, DAY_MS, pointsById, startOfDay } from "./lib/joins";
import { appendCustodyEvent } from "./model/custody";

// Producer view (/oem/service): collections that touch their containers.
export const myCollections = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireProducer(ctx);
    const containers = await containersById(ctx);
    const points = await pointsById(ctx);
    const all = await ctx.db.query("collections").collect();
    return all
      .filter(
        (c) => containers.get(c.containerId)?.custodianOrgId === org._id,
      )
      .sort((a, b) => b.scheduledFor - a.scheduledFor)
      .map((c) => ({
        _id: c._id,
        container: containers.get(c.containerId)?.tag ?? "—",
        site: points.get(c.pointId)?.name ?? "—",
        scheduledFor: c.scheduledFor,
        status: c.status,
        expectedFillPct: c.expectedFillPct,
        collectedMassKg: c.collectedMassKg ?? null,
        completedAt: c.completedAt ?? null,
      }));
  },
});

// Field home: today's stops for the crew.
export const todayStops = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const containers = await containersById(ctx);
    const points = await pointsById(ctx);
    const today = startOfDay(Date.now());
    const all = await ctx.db
      .query("collections")
      .withIndex("by_scheduledFor", (q) =>
        q.gte("scheduledFor", today).lt("scheduledFor", today + DAY_MS),
      )
      .collect();
    return all
      .sort(
        (a, b) =>
          (a.routeOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.routeOrder ?? Number.MAX_SAFE_INTEGER),
      )
      .map((c) => {
        const point = points.get(c.pointId);
        return {
          _id: c._id,
          site: point?.name ?? "—",
          address: point?.address ?? "—",
          lat: point?.lat ?? null,
          lng: point?.lng ?? null,
          containerId: c.containerId,
          container: containers.get(c.containerId)?.tag ?? "—",
          expectedFillPct: c.expectedFillPct,
          distanceKm: c.distanceKm ?? null,
          status: c.status,
        };
      });
  },
});

// Order today's scheduled stops into a route and mark them en route.
export const planRoute = mutation({
  args: { collectionIds: v.array(v.id("collections")) },
  handler: async (ctx, args) => {
    const { member } = await requireStaff(ctx);
    let order = 0;
    for (const id of args.collectionIds) {
      const c = await ctx.db.get(id);
      if (!c || c.status !== "scheduled") continue;
      await ctx.db.patch(id, {
        status: "en_route",
        routeOrder: order++,
        assignedMemberId: member._id,
      });
    }
    return { planned: order };
  },
});

export const markArrived = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const c = await ctx.db.get(args.collectionId);
    if (!c) throw new Error("Collection not found");
    if (c.status === "collected") throw new Error("Already collected");
    await ctx.db.patch(args.collectionId, { status: "arrived" });
  },
});

// Completing the five-step wizard: weigh, count, sign, confirm.
export const completeCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    massKg: v.number(),
    unitCount: v.number(),
    tempOk: v.boolean(),
    signatureHash: v.string(),
  },
  handler: async (ctx, args) => {
    const { org, member } = await requireStaff(ctx);
    const c = await ctx.db.get(args.collectionId);
    if (!c) throw new Error("Collection not found");
    if (c.status === "collected") throw new Error("Already collected");
    if (!args.tempOk)
      throw new Error("Temperature check failed — refuse the container");
    if (!(args.massKg > 0)) throw new Error("Weight must be positive");
    const container = await ctx.db.get(c.containerId);
    if (!container) throw new Error("Container not found");
    const now = Date.now();

    await ctx.db.patch(args.collectionId, {
      status: "collected",
      collectedMassKg: args.massKg,
      unitCount: args.unitCount,
      tempOk: true,
      signatureHash: args.signatureHash,
      assignedMemberId: member._id,
      completedAt: now,
    });
    const fromOrgId = container.custodianOrgId;
    await ctx.db.patch(c.containerId, {
      stage: "in_transit",
      fillPct: 0,
      currentMassKg: 0,
      custodianOrgId: org._id,
      lastTempCheckAt: now,
    });
    await appendCustodyEvent(ctx, {
      at: now,
      type: "temp_check",
      containerId: c.containerId,
      actorOrgId: org._id,
      note: "Pass",
    });
    await appendCustodyEvent(ctx, {
      at: now,
      type: "weigh",
      containerId: c.containerId,
      actorOrgId: org._id,
      massKg: args.massKg,
      note: `${args.unitCount} units`,
    });
    await appendCustodyEvent(ctx, {
      at: now,
      type: "pickup",
      containerId: c.containerId,
      actorOrgId: org._id,
      fromOrgId,
      toOrgId: org._id,
      massKg: args.massKg,
      note: "Collected — signature on file",
    });
  },
});

export const refuseCollection = mutation({
  args: { collectionId: v.id("collections"), reason: v.string() },
  handler: async (ctx, args) => {
    const { org } = await requireStaff(ctx);
    const c = await ctx.db.get(args.collectionId);
    if (!c) throw new Error("Collection not found");
    if (c.status === "collected") throw new Error("Already collected");
    await ctx.db.patch(args.collectionId, {
      status: "refused",
      note: args.reason,
      completedAt: Date.now(),
    });
    await appendCustodyEvent(ctx, {
      at: Date.now(),
      type: "temp_check",
      containerId: c.containerId,
      actorOrgId: org._id,
      note: `Refused — ${args.reason}`,
    });
  },
});
