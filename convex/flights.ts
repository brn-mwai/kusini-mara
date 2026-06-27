import { v } from "convex/values";
import {
  airlineMutation,
  airlineQuery,
  assertLinked,
  requireAirlineFlight,
  requireAirlineMovement,
} from "./lib/tenancy";
import { recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

async function legsFor(ctx: QueryCtx, flightId: Doc<"flights">["_id"]) {
  return await ctx.db
    .query("movements")
    .withIndex("by_flight", (q) => q.eq("flightId", flightId))
    .collect();
}

async function enrichFlight(ctx: QueryCtx, f: Doc<"flights">) {
  const legs = (await legsFor(ctx, f._id)).filter((m) => m.status !== "completed");
  const aircraft = await ctx.db
    .query("aircraft")
    .withIndex("by_reg", (q) => q.eq("reg", f.aircraftReg))
    .first();
  const acked = legs.filter((m) => m.status === "acknowledged" || m.status === "in_flight").length;
  const escalated = legs.some((m) => m.status === "escalated");
  const pax = legs.reduce((s, m) => s + m.pax, 0);
  const circuit: string[] = [];
  for (const m of legs.slice().sort((a, b) => a.scheduledTime - b.scheduledTime)) {
    if (!circuit.includes(m.airstrip)) circuit.push(m.airstrip);
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
      lodgeId: m.lodgeId,
      direction: m.direction,
      airstrip: m.airstrip,
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

// Airline flights board — every flight the caller's airline owns, enriched with
// its manifest, lodge-ack count, and circuit.
export const board = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const flights = await ctx.db
      .query("flights")
      .withIndex("by_airline", (q) => q.eq("airlineId", ctx.org._id))
      .collect();
    return await Promise.all(flights.map((f) => enrichFlight(ctx, f)));
  },
});

// Requests queue — movements awaiting a flight (the airline's inbox).
export const requests = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("movements")
      .withIndex("by_airline_status", (q) =>
        q.eq("airlineId", ctx.org._id).eq("status", "requested"),
      )
      .collect();
    rows.sort((a, b) => a.scheduledTime - b.scheduledTime);
    return await Promise.all(
      rows.map(async (m) => {
        const lodge = await ctx.db.get(m.lodgeId);
        return { ...m, lodgeName: lodge?.name ?? "—" };
      }),
    );
  },
});

// Build a new flight (aircraft + pilot + departure). Returns its id so the
// caller can immediately schedule movements onto it.
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
      airlineId: ctx.org._id,
      code: args.code,
      aircraftReg: args.aircraftReg,
      pilotName: args.pilotName,
      departTime: args.departTime,
      base: args.base ?? "Wilson",
      status: "planned",
    });
  },
});

// THE schedule action. Attach a queued movement to a flight → status becomes
// `scheduled` and it surfaces on the lodge board as a confirmed transfer
// awaiting acknowledgment. If the movement was already acknowledged and the time
// moves, the prior ack is invalidated (reconfirmRequested).
export const scheduleMovement = airlineMutation({
  args: {
    movementId: v.id("movements"),
    flightId: v.id("flights"),
    scheduledTime: v.optional(v.number()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const m = await requireAirlineMovement(ctx, ctx.org, args.movementId);
    const flight = await requireAirlineFlight(ctx, ctx.org, args.flightId);
    await assertLinked(ctx, ctx.org._id, m.lodgeId);

    const newTime = args.scheduledTime ?? m.scheduledTime;
    const timeChanged = newTime !== m.scheduledTime;
    const wasAcked = m.status === "acknowledged";
    const deadline = newTime - escalationWindowMs();

    await ctx.db.patch(m._id, {
      flightId: flight._id,
      scheduledTime: newTime,
      escalationDeadline: deadline,
      status: "scheduled",
      reconfirmRequested: wasAcked && timeChanged ? true : m.reconfirmRequested,
    });

    await recordEvent(ctx, {
      correlationId: m.correlationId,
      lodgeId: m.lodgeId,
      airlineId: m.airlineId,
      type: wasAcked && timeChanged ? "movement_rescheduled" : "movement_scheduled",
      summary: `${m.guestName} (${m.direction}) scheduled on ${flight.aircraftReg} at ${m.airstrip}`,
      movementId: m._id,
      byUserId: ctx.user._id,
      meta: { flightCode: flight.code, scheduledTime: newTime },
    });
    if (wasAcked && timeChanged) {
      await recordEvent(ctx, {
        correlationId: m.correlationId,
        lodgeId: m.lodgeId,
        airlineId: m.airlineId,
        type: "movement_reconfirm_requested",
        summary: `Time changed after acknowledgment — reconfirm required`,
        movementId: m._id,
        byUserId: ctx.user._id,
      });
    }
    return { ok: true };
  },
});

// Dispatch a planned flight → in_flight. Acknowledged legs go in_flight with it.
export const dispatch = airlineMutation({
  args: { flightId: v.id("flights") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const flight = await requireAirlineFlight(ctx, ctx.org, args.flightId);
    if (flight.status !== "planned" && flight.status !== "boarding") {
      throw new Error("Flight is not in a dispatchable state");
    }
    await ctx.db.patch(flight._id, { status: "in_flight" });
    const legs = await legsFor(ctx, flight._id);
    for (const m of legs) {
      if (m.status === "acknowledged") {
        await ctx.db.patch(m._id, { status: "in_flight" });
      }
    }
    await recordEvent(ctx, {
      correlationId: legs[0]?.correlationId ?? flight.code,
      lodgeId: legs[0]?.lodgeId ?? flight.airlineId,
      airlineId: flight.airlineId,
      type: "flight_dispatched",
      summary: `${flight.aircraftReg} dispatched from ${flight.base}`,
      meta: { flightCode: flight.code },
    });
    return { ok: true };
  },
});

// Land a flight → completed. Its in-progress legs complete.
export const land = airlineMutation({
  args: { flightId: v.id("flights") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const flight = await requireAirlineFlight(ctx, ctx.org, args.flightId);
    await ctx.db.patch(flight._id, { status: "completed" });
    const legs = await legsFor(ctx, flight._id);
    for (const m of legs) {
      if (m.status === "in_flight" || m.status === "acknowledged" || m.status === "scheduled") {
        await ctx.db.patch(m._id, { status: "completed" });
        await recordEvent(ctx, {
          correlationId: m.correlationId,
          lodgeId: m.lodgeId,
          airlineId: m.airlineId,
          type: "movement_completed",
          summary: `${m.guestName} (${m.direction}) completed`,
          movementId: m._id,
        });
      }
    }
    await recordEvent(ctx, {
      correlationId: legs[0]?.correlationId ?? flight.code,
      lodgeId: legs[0]?.lodgeId ?? flight.airlineId,
      airlineId: flight.airlineId,
      type: "flight_landed",
      summary: `${flight.aircraftReg} completed its circuit`,
      meta: { flightCode: flight.code },
    });
    return { ok: true };
  },
});
