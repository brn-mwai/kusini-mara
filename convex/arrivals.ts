import { v } from "convex/values";
import {
  propertyMutation,
  propertyQuery,
  requirePropertyArrival,
} from "./lib/tenancy";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import { transportMode, direction } from "./schema";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

async function enrich(ctx: QueryCtx, a: Doc<"arrivalEvents">) {
  const flight = a.flightId ? await ctx.db.get(a.flightId) : null;
  const duties = await ctx.db
    .query("dutyAssignments")
    .withIndex("by_arrival", (q) => q.eq("arrivalId", a._id))
    .collect();
  const staff = await Promise.all(
    duties.map(async (d) => {
      const s = await ctx.db.get(d.staffId);
      const veh = d.vehicleId ? await ctx.db.get(d.vehicleId) : null;
      return s ? { name: s.name, role: s.role, dutyType: d.dutyType, vehicle: veh?.name ?? null } : null;
    }),
  );
  return {
    ...a,
    flight: flight
      ? { code: flight.code, reg: flight.aircraftReg, pilot: flight.pilotName, status: flight.status }
      : null,
    assigned: staff.filter(Boolean),
  };
}

const MODE_DETAIL = v.optional(
  v.object({
    flightId: v.optional(v.string()),
    aircraftReg: v.optional(v.string()),
    pilotName: v.optional(v.string()),
    pilotContact: v.optional(v.string()),
    carrier: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    connectionNotes: v.optional(v.string()),
    operator: v.optional(v.string()),
    vehicle: v.optional(v.string()),
    driverContact: v.optional(v.string()),
    gateTime: v.optional(v.number()),
    landingPoint: v.optional(v.string()),
    routeNotes: v.optional(v.string()),
    guestVehicle: v.optional(v.string()),
  }),
);

// Property dashboard: every inbound/outbound arrival for the caller's property,
// across all transport modes.
export const board = propertyQuery({
  args: { direction: v.optional(direction) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();
    const filtered = args.direction
      ? rows.filter((a) => a.direction === args.direction)
      : rows;
    filtered.sort((a, b) => a.scheduledTime - b.scheduledTime);
    return await Promise.all(filtered.map((a) => enrich(ctx, a)));
  },
});

// Create an arrival from the lodge side (any mode). Charter without a flight
// lands as `requested` and surfaces on the airline's queue; other modes carry a
// firm time and await acknowledgment.
export const create = propertyMutation({
  args: {
    mode: transportMode,
    direction,
    origin: v.string(),
    destinationLabel: v.string(),
    guestName: v.string(),
    pax: v.number(),
    scheduledTime: v.number(),
    airstripName: v.optional(v.string()),
    special: v.optional(v.array(v.string())),
    luggage: v.optional(v.string()),
    modeDetail: MODE_DETAIL,
  },
  returns: v.object({ arrivalId: v.id("arrivalEvents") }),
  handler: async (ctx, args) => {
    // Resolve airstrip + serving airline for charter legs.
    let airstripId: Doc<"arrivalEvents">["airstripId"] = undefined;
    if (args.airstripName) {
      const strip = await ctx.db
        .query("airstrips")
        .withIndex("by_name", (q) => q.eq("name", args.airstripName!))
        .first();
      airstripId = strip?._id;
    }
    let airlineId: Doc<"arrivalEvents">["airlineId"] = undefined;
    if (args.mode === "charter") {
      const link = await ctx.db
        .query("airlinePropertyLinks")
        .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
        .first();
      airlineId = link?.airlineId;
    }

    const isCharter = args.mode === "charter";
    const status = isCharter ? "requested" : "scheduled";
    const correlationId = newCorrelationId();
    const arrivalId = await ctx.db.insert("arrivalEvents", {
      mode: args.mode,
      direction: args.direction,
      propertyId: ctx.property._id,
      operatorId: ctx.property.operatorId,
      airlineId,
      airstripId,
      origin: args.origin,
      destinationLabel: args.destinationLabel,
      guestName: args.guestName,
      pax: args.pax,
      special: args.special ?? [],
      luggage: args.luggage,
      scheduledTime: args.scheduledTime,
      status,
      modeDetail: args.modeDetail,
      createdBy: "property",
      claimedByAirline: false,
      reconfirmRequested: false,
      escalationDeadline: isCharter ? undefined : args.scheduledTime - escalationWindowMs(),
      correlationId,
    });
    await recordEvent(ctx, {
      correlationId,
      propertyId: ctx.property._id,
      airlineId,
      type: "arrival_created",
      summary: `${args.mode} ${args.direction} created for ${args.guestName} (${args.pax} pax) from ${args.origin}`,
      arrivalId,
      byUserId: ctx.user._id,
    });
    return { arrivalId };
  },
});

// Full detail for one arrival — guests, transport detail, ground duties, room,
// and the correlation-linked timeline. Powers the arrival drawer.
export const get = propertyQuery({
  args: { arrivalId: v.id("arrivalEvents") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const a = await ctx.db.get(args.arrivalId);
    if (!a || a.propertyId !== ctx.property._id) return null;
    const flight = a.flightId ? await ctx.db.get(a.flightId) : null;
    const guests = await ctx.db
      .query("arrivalGuests")
      .withIndex("by_arrival", (q) => q.eq("arrivalId", a._id))
      .collect();
    const events = await ctx.db
      .query("transferEvents")
      .withIndex("by_arrival", (q) => q.eq("arrivalId", a._id))
      .order("asc")
      .collect();
    const duties = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_arrival", (q) => q.eq("arrivalId", a._id))
      .collect();
    const dutyRows = await Promise.all(
      duties.map(async (d) => {
        const s = await ctx.db.get(d.staffId);
        const veh = d.vehicleId ? await ctx.db.get(d.vehicleId) : null;
        return { id: d._id, staff: s?.name ?? "—", role: s?.role ?? "", vehicle: veh?.name ?? null, dutyType: d.dutyType, status: d.status };
      }),
    );
    const ra = await ctx.db
      .query("roomAssignments")
      .withIndex("by_arrival", (q) => q.eq("arrivalId", a._id))
      .first();
    const room = ra ? await ctx.db.get(ra.roomId) : null;
    return {
      ...a,
      flight: flight ? { code: flight.code, reg: flight.aircraftReg, pilot: flight.pilotName, status: flight.status } : null,
      guests, events, duties: dutyRows,
      room: room ? { name: room.name, type: room.type } : null,
    };
  },
});

// Cancel an arrival (soft — keeps the audit trail).
export const cancel = propertyMutation({
  args: { arrivalId: v.id("arrivalEvents"), reason: v.optional(v.string()) },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    await ctx.db.patch(a._id, { status: "cancelled", cancelledAt: Date.now(), cancelReason: args.reason });
    await recordEvent(ctx, {
      correlationId: a.correlationId, propertyId: a.propertyId, airlineId: a.airlineId,
      type: "arrival_cancelled", summary: `${ctx.user.name} cancelled ${a.guestName}${args.reason ? ` — ${args.reason}` : ""}`,
      arrivalId: a._id, byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});

// Property acknowledges a scheduled arrival → closes the loop.
export const acknowledge = propertyMutation({
  args: { arrivalId: v.id("arrivalEvents") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    if (a.status === "requested") throw new Error("Cannot acknowledge before the transport is confirmed");
    if (a.status === "acknowledged" && !a.reconfirmRequested) return { ok: true };

    const isReconfirm = a.reconfirmRequested;
    const now = Date.now();
    await ctx.db.patch(a._id, {
      status: "acknowledged",
      acknowledgedAt: now,
      lastAckUserId: ctx.user._id,
      reconfirmRequested: false,
      escalatedAt: undefined,
    });
    await ctx.db.insert("acknowledgments", {
      arrivalId: a._id,
      propertyId: a.propertyId,
      byUserId: ctx.user._id,
      at: now,
      channel: "mock",
      type: isReconfirm ? "reconfirm" : "initial",
    });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "arrival_acknowledged",
      summary: `${ctx.user.name} acknowledged ${a.guestName} (${a.mode} ${a.direction})`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});
