import { v } from "convex/values";
import {
  lodgeMutation,
  lodgeQuery,
  orgQuery,
  requireLodgeMovement,
} from "./lib/tenancy";
import { recordEvent } from "./lib/events";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";

// Join a movement to its flight + ground assignment for board display. Cheap at
// this domain's volume (a handful of movements per lodge per day).
async function enrich(ctx: QueryCtx, m: Doc<"movements">) {
  const flight = m.flightId ? await ctx.db.get(m.flightId) : null;
  const duty = await ctx.db
    .query("dutyAssignments")
    .withIndex("by_movement", (q) => q.eq("movementId", m._id))
    .first();
  const staff = duty ? await ctx.db.get(duty.staffId) : null;
  return {
    ...m,
    flight: flight
      ? { code: flight.code, reg: flight.aircraftReg, pilot: flight.pilotName, status: flight.status }
      : null,
    assignedStaff: staff ? { id: staff._id, name: staff.name, role: staff.role } : null,
  };
}

// Lodge board: all active movements for the caller's lodge, newest scheduled
// first. The UI groups by direction / day; the server just scopes by tenant.
export const board = lodgeQuery({
  args: { direction: v.optional(v.union(v.literal("arrival"), v.literal("departure"))) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("movements")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .collect();
    const filtered = args.direction
      ? rows.filter((m) => m.direction === args.direction)
      : rows;
    filtered.sort((a, b) => a.scheduledTime - b.scheduledTime);
    return await Promise.all(filtered.map((m) => enrich(ctx, m)));
  },
});

// Single movement detail (either tenant on the row may read it).
export const get = orgQuery({
  args: { movementId: v.id("movements") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.movementId);
    if (!m) return null;
    if (m.lodgeId !== ctx.org._id && m.airlineId !== ctx.org._id) return null;
    const events = await ctx.db
      .query("transferEvents")
      .withIndex("by_movement", (q) => q.eq("movementId", m._id))
      .order("desc")
      .collect();
    return { ...(await enrich(ctx, m)), events };
  },
});

// THE acknowledgment. Lodge confirms a scheduled movement → closes the loop.
// The airline's flight ack count ticks up live off this one write.
export const acknowledge = lodgeMutation({
  args: { movementId: v.id("movements") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const m = await requireLodgeMovement(ctx, ctx.org, args.movementId);
    if (!m.flightId) throw new Error("Cannot acknowledge before a flight is scheduled");
    if (m.status === "acknowledged" && !m.reconfirmRequested) {
      return { ok: true }; // idempotent
    }

    const isReconfirm = m.reconfirmRequested;
    const now = Date.now();
    await ctx.db.patch(m._id, {
      status: "acknowledged",
      acknowledgedAt: now,
      lastAckUserId: ctx.user._id,
      reconfirmRequested: false,
      escalatedAt: undefined,
    });
    await ctx.db.insert("acknowledgments", {
      movementId: m._id,
      lodgeId: m.lodgeId,
      byUserId: ctx.user._id,
      at: now,
      channel: "mock",
      type: isReconfirm ? "reconfirm" : "initial",
    });
    await recordEvent(ctx, {
      correlationId: m.correlationId,
      lodgeId: m.lodgeId,
      airlineId: m.airlineId,
      type: "movement_acknowledged",
      summary: `${ctx.user.name} acknowledged ${m.guestName} (${m.direction}) at ${m.airstrip}`,
      movementId: m._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});
