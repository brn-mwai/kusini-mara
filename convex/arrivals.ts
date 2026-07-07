import { v } from "convex/values";
import {
  propertyMutation,
  propertyQuery,
  requirePropertyArrival,
} from "./lib/tenancy";
import { newCorrelationId, recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import { queueSms } from "./lib/notify";
import {
  assignedSide,
  defaultAssignedSide,
  effectivePickupTime,
  guestReportTime,
  hhmm,
  isAckable,
  isAirMode,
} from "./lib/handshake";
import { transportMode, direction, partySide } from "./schema";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

async function enrich(ctx: QueryCtx, a: Doc<"arrivalEvents">, reportOffsetDefault: number) {
  const flight = a.flightId ? await ctx.db.get(a.flightId) : null;
  const strip = a.airstripId ? await ctx.db.get(a.airstripId) : null;
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
    assignedToSide: assignedSide(a),
    pickupTime: effectivePickupTime(a),
    guestReportTime: guestReportTime(a, reportOffsetDefault),
    stripCondition: strip?.condition
      ? { condition: strip.condition, note: strip.conditionNote ?? null }
      : null,
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
    const offset = ctx.property.defaultReportOffsetMinutes ?? 30;
    return await Promise.all(filtered.map((a) => enrich(ctx, a, offset)));
  },
});

// Post a movement from the lodge side (any mode): create it, assign the other
// side, and propose a pickup time. Charter without a flight lands as `requested`
// and surfaces on the air queue first; every other mode carries a firm time and
// awaits the assigned side's acknowledgment.
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
    assignedToSide: v.optional(partySide),
    proposedPickupTime: v.optional(v.number()),
    guestReportOffsetMinutes: v.optional(v.number()),
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
    // A movement with no strip party can only be assigned to the lodge itself.
    const assignedToSide =
      airstripId || isAirMode(args.mode)
        ? args.assignedToSide ?? defaultAssignedSide(args.mode, args.direction)
        : "lodge";
    const proposedPickupTime = args.proposedPickupTime ?? args.scheduledTime;
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
      postedBySide: "lodge",
      assignedToSide,
      proposedPickupTime,
      guestReportOffsetMinutes:
        args.guestReportOffsetMinutes ?? ctx.property.defaultReportOffsetMinutes ?? 30,
      claimedByAirline: false,
      reconfirmRequested: false,
      escalationDeadline: isCharter ? undefined : proposedPickupTime - escalationWindowMs(),
      correlationId,
    });
    await recordEvent(ctx, {
      correlationId,
      propertyId: ctx.property._id,
      airlineId,
      type: "arrival_created",
      summary: `${args.mode} ${args.direction} posted for ${args.guestName} (${args.pax} pax) from ${args.origin} — assigned to ${assignedToSide}`,
      arrivalId,
      byUserId: ctx.user._id,
    });
    // The record is the truth; the message is only the nudge. Prompt the
    // assigned strip side to acknowledge (demo: the air org's ops desk).
    if (assignedToSide === "airstrip" && airlineId) {
      const airline = await ctx.db.get(airlineId);
      if (airline?.opsPhone) {
        await queueSms(ctx, {
          toPhone: airline.opsPhone,
          arrivalId,
          propertyId: ctx.property._id,
          airlineId,
          kind: "arrival_posted",
          body: `KUSINI: ${ctx.property.name} posted ${args.guestName} (${args.pax} pax) ${args.direction} at ${args.destinationLabel}, proposed pickup ${hhmm(proposedPickupTime)}. Please acknowledge and set the pickup time.`,
          correlationId,
        });
      }
    }
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
    const strip = a.airstripId ? await ctx.db.get(a.airstripId) : null;
    const offset = ctx.property.defaultReportOffsetMinutes ?? 30;
    return {
      ...a,
      flight: flight ? { code: flight.code, reg: flight.aircraftReg, pilot: flight.pilotName, status: flight.status } : null,
      guests, events, duties: dutyRows,
      room: room ? { name: room.name, type: room.type } : null,
      assignedToSide: assignedSide(a),
      pickupTime: effectivePickupTime(a),
      guestReportTime: guestReportTime(a, offset),
      stripCondition: strip?.condition
        ? { condition: strip.condition, note: strip.conditionNote ?? null }
        : null,
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

// The lodge acknowledges a movement assigned to it and sets the pickup time
// (accepting the poster's proposal unless it adjusts). Movements assigned to
// the airstrip side are acknowledged on the air platform, not here.
export const acknowledge = propertyMutation({
  args: {
    arrivalId: v.id("arrivalEvents"),
    pickupTime: v.optional(v.number()), // omit = accept the proposed time
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    if (a.status === "requested") throw new Error("Cannot acknowledge before the transport is confirmed");
    if (assignedSide(a) !== "lodge") {
      throw new Error("This movement is assigned to the airstrip side to acknowledge");
    }
    if (a.status === "acknowledged" && !a.reconfirmRequested) return { ok: true };
    if (!isAckable(a)) throw new Error("Movement is not awaiting acknowledgment");

    const isReconfirm = a.reconfirmRequested || a.status === "reconfirm_required";
    const now = Date.now();
    const confirmedPickupTime = args.pickupTime ?? a.proposedPickupTime ?? a.scheduledTime;
    await ctx.db.patch(a._id, {
      status: "acknowledged",
      acknowledgedAt: now,
      lastAckUserId: ctx.user._id,
      confirmedPickupTime,
      reconfirmRequested: false,
      escalatedAt: undefined,
    });
    await ctx.db.insert("acknowledgments", {
      arrivalId: a._id,
      propertyId: a.propertyId,
      byUserId: ctx.user._id,
      bySide: "lodge",
      pickupTimeSet: confirmedPickupTime,
      at: now,
      channel: "mock",
      type: isReconfirm ? "reconfirm" : "initial",
    });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "arrival_acknowledged",
      summary: `${ctx.user.name} (lodge) acknowledged ${a.guestName} (${a.mode} ${a.direction}) — pickup ${hhmm(confirmedPickupTime)}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});

// ── execution signals (lodge side): vehicle dispatched → guest collected ──────
export const markDispatched = propertyMutation({
  args: { arrivalId: v.id("arrivalEvents") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    if (!["acknowledged", "in_transit"].includes(a.status)) {
      throw new Error("Acknowledge the movement before dispatching the vehicle");
    }
    const now = Date.now();
    await ctx.db.patch(a._id, { dispatchedAt: now, status: "in_transit" });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "vehicle_dispatched",
      summary: `Vehicle dispatched for ${a.guestName} → ${a.destinationLabel}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});

export const markCollected = propertyMutation({
  args: { arrivalId: v.id("arrivalEvents") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    if (["completed", "cancelled"].includes(a.status)) return { ok: true };
    const now = Date.now();
    await ctx.db.patch(a._id, { collectedAt: now, actualTime: a.actualTime ?? now, status: "completed" });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "guest_collected",
      summary: `${a.guestName} collected — movement complete`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});
