// ─────────────────────────────────────────────────────────────────────────────
// The airstrip side of the handshake. In the demo the air app's org (the
// airline) acts for the strip handlers at the strips it serves; production
// would resolve a real airstrip-operator identity. The functions here are the
// strip half of post → assign → acknowledge → set pickup time, plus the
// execution signals (landed) and the strip's live condition.
// ─────────────────────────────────────────────────────────────────────────────
import { v } from "convex/values";
import { airlineMutation, airlineQuery, requireAirlineArrival } from "./lib/tenancy";
import { recordEvent } from "./lib/events";
import { escalationWindowMs } from "./lib/constants";
import { queueSms } from "./lib/notify";
import {
  assignedSide,
  effectivePickupTime,
  hhmm,
  isAckable,
} from "./lib/handshake";
import { airstripCondition } from "./schema";

// Movements at this org's strips that the airstrip side must acknowledge —
// the strip handler's inbox, unacknowledged first.
export const pendingAcks = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_airline", (q) => q.eq("airlineId", ctx.airline._id))
      .collect();
    const pending = rows.filter(
      (a) => assignedSide(a) === "airstrip" && isAckable(a),
    );
    pending.sort((a, b) => a.scheduledTime - b.scheduledTime);
    return await Promise.all(
      pending.map(async (a) => {
        const prop = await ctx.db.get(a.propertyId);
        const strip = a.airstripId ? await ctx.db.get(a.airstripId) : null;
        return {
          ...a,
          propertyName: prop?.name ?? "—",
          stripName: strip?.name ?? a.destinationLabel,
          stripCondition: strip?.condition ?? null,
          pickupTime: effectivePickupTime(a),
        };
      }),
    );
  },
});

// The airstrip side acknowledges a movement assigned to it and sets the pickup
// time — the accountability moment on the strip half of the loop.
export const acknowledge = airlineMutation({
  args: {
    arrivalId: v.id("arrivalEvents"),
    pickupTime: v.optional(v.number()), // omit = accept the proposed time
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requireAirlineArrival(ctx, ctx.airline, args.arrivalId);
    if (a.status === "requested") throw new Error("Cannot acknowledge before the movement is on a flight");
    if (assignedSide(a) !== "airstrip") {
      throw new Error("This movement is assigned to the lodge side to acknowledge");
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
      bySide: "airstrip",
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
      summary: `${ctx.user.name} (airstrip) acknowledged ${a.guestName} at ${a.destinationLabel} — pickup ${hhmm(confirmedPickupTime)}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});

// Re-protection: the carrier/strip/time changes ("re-protect Mombaertsx3 onto
// Safarilink… pick up at 11h25"). Voids the prior acknowledgment and pickup
// time, flags reconfirm, and re-notifies both sides.
export const reprotect = airlineMutation({
  args: {
    arrivalId: v.id("arrivalEvents"),
    carrierName: v.optional(v.string()),
    carrierOpsContact: v.optional(v.string()),
    airstripName: v.optional(v.string()),
    scheduledTime: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requireAirlineArrival(ctx, ctx.airline, args.arrivalId);
    if (["completed", "cancelled"].includes(a.status)) {
      throw new Error("Cannot re-protect a finished movement");
    }
    const now = Date.now();
    const fromCarrier = a.carrierName ?? ctx.airline.name;

    let airstripId = a.airstripId;
    let destinationLabel = a.destinationLabel;
    if (args.airstripName) {
      const strip = await ctx.db
        .query("airstrips")
        .withIndex("by_name", (q) => q.eq("name", args.airstripName!))
        .first();
      if (!strip) throw new Error(`Unknown airstrip: ${args.airstripName}`);
      airstripId = strip._id;
      destinationLabel = strip.name;
    }
    const newTime = args.scheduledTime ?? a.scheduledTime;
    const carrierChanged = !!args.carrierName && args.carrierName !== fromCarrier;

    await ctx.db.patch(a._id, {
      carrierName: args.carrierName ?? a.carrierName,
      carrierOpsContact: args.carrierOpsContact ?? a.carrierOpsContact,
      airstripId,
      destinationLabel,
      scheduledTime: newTime,
      proposedPickupTime: newTime,
      // A movement re-protected onto another carrier leaves this org's aircraft.
      flightId: carrierChanged ? undefined : a.flightId,
      confirmedPickupTime: undefined,
      acknowledgedAt: undefined,
      status: "reconfirm_required",
      reconfirmRequested: true,
      reprotectCount: (a.reprotectCount ?? 0) + 1,
      lastReprotectedAt: now,
      escalationDeadline: newTime - escalationWindowMs(),
      escalatedAt: undefined,
    });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "arrival_reprotected",
      summary: `${a.guestName} re-protected${args.carrierName ? ` onto ${args.carrierName}` : ""} — ${destinationLabel} ${hhmm(newTime)}${args.reason ? ` (${args.reason})` : ""}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
      meta: { fromCarrier, toCarrier: args.carrierName ?? fromCarrier, newTime },
    });

    // Re-notify both sides: the prior ack no longer stands.
    const property = await ctx.db.get(a.propertyId);
    const body = `KUSINI RE-PROTECT: ${a.guestName} (${a.pax} pax) now${args.carrierName ? ` on ${args.carrierName}` : ""} at ${destinationLabel} ${hhmm(newTime)}. Prior confirmation is void — please re-acknowledge.`;
    const dutyId = property?.dutyContactId ?? property?.backupContactId;
    const duty = dutyId ? await ctx.db.get(dutyId) : null;
    if (duty?.phoneE164) {
      await queueSms(ctx, {
        toPhone: duty.phoneE164,
        toUserId: duty._id,
        arrivalId: a._id,
        propertyId: a.propertyId,
        airlineId: a.airlineId,
        kind: "reprotect",
        body,
        correlationId: a.correlationId,
      });
    }
    if (ctx.airline.opsPhone) {
      await queueSms(ctx, {
        toPhone: ctx.airline.opsPhone,
        arrivalId: a._id,
        propertyId: a.propertyId,
        airlineId: a.airlineId,
        kind: "reprotect",
        body,
        correlationId: a.correlationId,
      });
    }
    return { ok: true };
  },
});

// Execution signal (airstrip side): the aircraft is down at the strip.
export const markLanded = airlineMutation({
  args: { arrivalId: v.id("arrivalEvents") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const a = await requireAirlineArrival(ctx, ctx.airline, args.arrivalId);
    if (!["acknowledged", "in_transit"].includes(a.status)) {
      throw new Error("Movement is not in execution");
    }
    const now = Date.now();
    await ctx.db.patch(a._id, { landedAt: now, status: "in_transit" });
    await recordEvent(ctx, {
      correlationId: a.correlationId,
      propertyId: a.propertyId,
      airlineId: a.airlineId,
      type: "arrival_landed",
      summary: `${a.guestName} landed at ${a.destinationLabel}`,
      arrivalId: a._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});

// Strips the org serves, with their live condition — the strip register.
export const strips = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const all = await ctx.db.query("airstrips").collect();
    all.sort((a, b) => a.name.localeCompare(b.name));
    return all;
  },
});

// The strip side sets the live condition ("waterlogged — 4x4 only"). Flows onto
// both boards; lodges using the strip get an SMS heads-up on degradation.
export const setCondition = airlineMutation({
  args: {
    airstripId: v.id("airstrips"),
    condition: airstripCondition,
    note: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const strip = await ctx.db.get(args.airstripId);
    if (!strip) throw new Error("Airstrip not found");
    await ctx.db.patch(strip._id, {
      condition: args.condition,
      conditionNote: args.note,
      conditionUpdatedAt: Date.now(),
    });
    if (args.condition !== "open") {
      const links = await ctx.db
        .query("propertyAirstrips")
        .withIndex("by_airstrip", (q) => q.eq("airstripId", strip._id))
        .collect();
      for (const link of links) {
        const property = await ctx.db.get(link.propertyId);
        const dutyId = property?.dutyContactId ?? property?.backupContactId;
        const duty = dutyId ? await ctx.db.get(dutyId) : null;
        if (duty?.phoneE164) {
          await queueSms(ctx, {
            toPhone: duty.phoneE164,
            toUserId: duty._id,
            propertyId: link.propertyId,
            airlineId: ctx.airline._id,
            kind: "strip_condition",
            body: `KUSINI: ${strip.name} is now ${args.condition.toUpperCase()}${args.note ? ` — ${args.note}` : ""}. Check today's pickups.`,
          });
        }
      }
    }
    return { ok: true };
  },
});
