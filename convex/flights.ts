import { v } from "convex/values";
import {
  airlineMutation,
  airlineQuery,
  assertLinked,
  requireAirlineArrival,
  requireAirlineFlight,
} from "./lib/tenancy";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import { direction } from "./schema";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

async function legsFor(ctx: QueryCtx, flightId: Doc<"flights">["_id"]) {
  return await ctx.db
    .query("arrivalEvents")
    .withIndex("by_flight", (q) => q.eq("flightId", flightId))
    .collect();
}

async function enrichFlight(ctx: QueryCtx, f: Doc<"flights">) {
  const legs = (await legsFor(ctx, f._id)).filter((m) => m.status !== "completed");
  const aircraft = await ctx.db
    .query("aircraft")
    .withIndex("by_reg", (q) => q.eq("reg", f.aircraftReg))
    .first();
  const acked = legs.filter((m) => m.status === "acknowledged" || m.status === "in_transit").length;
  const escalated = legs.some((m) => m.status === "escalated");
  const pax = legs.reduce((s, m) => s + m.pax, 0);
  const circuit: string[] = [];
  for (const m of legs.slice().sort((a, b) => a.scheduledTime - b.scheduledTime)) {
    if (!circuit.includes(m.destinationLabel)) circuit.push(m.destinationLabel);
  }
  const mixed =
    legs.some((m) => m.direction === "arrival") &&
    legs.some((m) => m.direction === "departure");
  return {
    ...f,
    seats: aircraft?.seats ?? 0,
    legs: legs.map((m) => ({
      id: m._id,
      guestName: m.guestName,
      propertyId: m.propertyId,
      direction: m.direction,
      airstrip: m.destinationLabel,
      pax: m.pax,
      status: m.status,
      scheduledTime: m.scheduledTime,
    })),
    legCount: legs.length,
    pax,
    ackCount: acked,
    escalated,
    circuit,
    mixed,
  };
}

export const board = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const flights = await ctx.db
      .query("flights")
      .withIndex("by_airline", (q) => q.eq("airlineId", ctx.airline._id))
      .collect();
    return await Promise.all(flights.map((f) => enrichFlight(ctx, f)));
  },
});

// Charter arrivals awaiting a flight (the airline's inbox).
export const requests = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_airline_status", (q) =>
        q.eq("airlineId", ctx.airline._id).eq("status", "requested"),
      )
      .collect();
    rows.sort((a, b) => a.scheduledTime - b.scheduledTime);
    return await Promise.all(
      rows.map(async (m) => {
        const prop = await ctx.db.get(m.propertyId);
        return { ...m, propertyName: prop?.name ?? "—" };
      }),
    );
  },
});

export const buildFlight = airlineMutation({
  args: {
    code: v.string(),
    aircraftReg: v.string(),
    pilotName: v.string(),
    departTime: v.number(),
    base: v.optional(v.string()),
  },
  returns: v.id("flights"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("flights", {
      airlineId: ctx.airline._id,
      code: args.code,
      aircraftReg: args.aircraftReg,
      pilotName: args.pilotName,
      departTime: args.departTime,
      base: args.base ?? "Wilson",
      status: "planned",
    });
  },
});

// Attach a queued charter arrival to a flight → scheduled (shows on the property
// board awaiting acknowledgment).
export const scheduleArrival = airlineMutation({
  args: {
    arrivalId: v.id("arrivalEvents"),
    flightId: v.id("flights"),
    scheduledTime: v.optional(v.number()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requireAirlineArrival(ctx, ctx.airline, args.arrivalId);
    const flight = await requireAirlineFlight(ctx, ctx.airline, args.flightId);
    await assertLinked(ctx, ctx.airline._id, a.propertyId);

    const newTime = args.scheduledTime ?? a.scheduledTime;
    const timeChanged = newTime !== a.scheduledTime;
    const wasAcked = a.status === "acknowledged";

    await ctx.db.patch(a._id, {
      flightId: flight._id,
      scheduledTime: newTime,
      escalationDeadline: newTime - escalationWindowMs(),
      status: "scheduled",
      reconfirmRequested: wasAcked && timeChanged ? true : a.reconfirmRequested,
    });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: wasAcked && timeChanged ? "arrival_rescheduled" : "arrival_scheduled",
      summary: `${a.guestName} (${a.direction}) scheduled on ${flight.aircraftReg}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
      meta: { flightCode: flight.code, scheduledTime: newTime },
    });
    if (wasAcked && timeChanged) {
      await recordEvent(ctx, {
        correlationId: a.correlationId,
        propertyId: a.propertyId,
        airlineId: a.airlineId,
        type: "arrival_reconfirm_requested",
        summary: "Time changed after acknowledgment — reconfirm required",
        arrivalId: a._id,
        byUserId: ctx.user._id,
      });
    }
    return { ok: true };
  },
});

// Airline-side dual entry: create a charter arrival directly (claimed by airline).
export const createCharter = airlineMutation({
  args: {
    propertyId: v.id("properties"),
    direction,
    origin: v.string(),
    airstripName: v.string(),
    guestName: v.string(),
    pax: v.number(),
    scheduledTime: v.number(),
  },
  returns: v.object({ arrivalId: v.id("arrivalEvents") }),
  handler: async (ctx, args) => {
    await assertLinked(ctx, ctx.airline._id, args.propertyId);
    const strip = await ctx.db
      .query("airstrips")
      .withIndex("by_name", (q) => q.eq("name", args.airstripName))
      .first();
    const correlationId = newCorrelationId();
    const arrivalId = await ctx.db.insert("arrivalEvents", {
      mode: "charter",
      direction: args.direction,
      propertyId: args.propertyId,
      airlineId: ctx.airline._id,
      airstripId: strip?._id,
      origin: args.origin,
      destinationLabel: args.airstripName,
      guestName: args.guestName,
      pax: args.pax,
      special: [],
      scheduledTime: args.scheduledTime,
      status: "requested",
      createdBy: "airline",
      claimedByAirline: true,
      reconfirmRequested: false,
      correlationId,
    });
    await recordEvent(ctx, {
      correlationId,
      propertyId: args.propertyId,
      airlineId: ctx.airline._id,
      type: "arrival_created",
      summary: `Charter ${args.direction} created by airline for ${args.guestName}`,
      arrivalId,
      byUserId: ctx.user._id,
    });
    return { arrivalId };
  },
});

export const dispatch = airlineMutation({
  args: { flightId: v.id("flights") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const flight = await requireAirlineFlight(ctx, ctx.airline, args.flightId);
    if (flight.status !== "planned" && flight.status !== "boarding") {
      throw new Error("Flight is not in a dispatchable state");
    }
    await ctx.db.patch(flight._id, { status: "in_flight" });
    const legs = await legsFor(ctx, flight._id);
    for (const m of legs) {
      if (m.status === "acknowledged") await ctx.db.patch(m._id, { status: "in_transit" });
    }
    await recordEvent(ctx, {
      correlationId: legs[0]?.correlationId ?? flight.code,
      propertyId: legs[0]?.propertyId ?? (await firstPropertyId(ctx)),
      airlineId: flight.airlineId,
      type: "flight_dispatched",
      summary: `${flight.aircraftReg} dispatched from ${flight.base}`,
      meta: { flightCode: flight.code },
    });
    return { ok: true };
  },
});

export const land = airlineMutation({
  args: { flightId: v.id("flights") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const flight = await requireAirlineFlight(ctx, ctx.airline, args.flightId);
    await ctx.db.patch(flight._id, { status: "completed" });
    const legs = await legsFor(ctx, flight._id);
    for (const m of legs) {
      if (["in_transit", "acknowledged", "scheduled"].includes(m.status)) {
        await ctx.db.patch(m._id, { status: "completed" });
        await recordEvent(ctx, {
          correlationId: m.correlationId,
          propertyId: m.propertyId,
          airlineId: m.airlineId,
          type: "arrival_completed",
          summary: `${m.guestName} (${m.direction}) completed`,
          arrivalId: m._id,
        });
      }
    }
    await recordEvent(ctx, {
      correlationId: legs[0]?.correlationId ?? flight.code,
      propertyId: legs[0]?.propertyId ?? (await firstPropertyId(ctx)),
      airlineId: flight.airlineId,
      type: "flight_landed",
      summary: `${flight.aircraftReg} completed its circuit`,
      meta: { flightCode: flight.code },
    });
    return { ok: true };
  },
});

async function firstPropertyId(ctx: QueryCtx) {
  const p = await ctx.db.query("properties").first();
  if (!p) throw new Error("No property");
  return p._id;
}
