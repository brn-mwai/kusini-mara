import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getDemoLodge } from "./lib/tenancy";
import { withId } from "./lib/base";
import { enqueueNotification } from "./lib/notify";

import { type MutationCtx, type QueryCtx } from "./_generated/server";

async function requireEvent(
  ctx: MutationCtx | QueryCtx,
  propertyId: string,
  arrivalEventId: string,
) {
  const event = await ctx.db
    .query("arrivalEvents")
    .withIndex("by_portable_id", (q) => q.eq("id", arrivalEventId))
    .first();
  if (!event || event.destinationPropertyId !== propertyId) {
    throw new Error("Movement not found.");
  }
  return event;
}

// Ops escape hatch: force a movement to acknowledged without the assigned side's
// tap (e.g. a handler confirmed by radio). Logged as a distinct audit action so
// the override is never mistaken for a real ack.
export const forceAcknowledge = mutation({
  args: { arrivalEventId: v.string(), reason: v.string() },
  handler: async (ctx, { arrivalEventId, reason }) => {
    const { property, operator } = await getDemoLodge(ctx);
    const event = await requireEvent(ctx, property.id, arrivalEventId);
    const now = Date.now();

    await ctx.db.patch(event._id, {
      status: "acknowledged" as const,
      escalationDeadline: undefined,
      updatedAt: now,
    });
    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: event.id,
          correlationId: event.correlationId,
          action: "force_acknowledged",
          fromStatus: event.status,
          toStatus: "acknowledged" as const,
          payload: { reason },
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );
    return { ok: true };
  },
});

export const cancel = mutation({
  args: { arrivalEventId: v.string(), reason: v.string() },
  handler: async (ctx, { arrivalEventId, reason }) => {
    const { property, operator } = await getDemoLodge(ctx);
    const event = await requireEvent(ctx, property.id, arrivalEventId);
    const now = Date.now();

    await ctx.db.patch(event._id, {
      status: "cancelled" as const,
      escalationDeadline: undefined,
      updatedAt: now,
    });
    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: event.id,
          correlationId: event.correlationId,
          action: "cancelled",
          fromStatus: event.status,
          toStatus: "cancelled" as const,
          payload: { reason },
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );
    return { ok: true };
  },
});

// Re-send the last notification for a movement (a handler says "never got it").
// Re-enqueues through the same outbox seam — no inline provider call.
export const resendNotification = mutation({
  args: { arrivalEventId: v.string() },
  handler: async (ctx, { arrivalEventId }) => {
    const { property, operator } = await getDemoLodge(ctx);
    const event = await requireEvent(ctx, property.id, arrivalEventId);

    const link = await ctx.db
      .query("propertyAirstrips")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .first();
    const stripId = event.airstripId ?? link?.airstripId;
    const handler = stripId
      ? await ctx.db
          .query("airstripContacts")
          .withIndex("by_airstrip", (q) => q.eq("airstripId", stripId))
          .first()
      : null;
    if (!handler) throw new Error("No strip handler to resend to.");

    const guest = event.guestNames?.[0] ?? "party";
    const id = await enqueueNotification(ctx, {
      recipient: {
        airstripContactId: handler.id,
        telegramChatId: handler.telegramChatId,
        phone: handler.phones.primaryPhoneNumber,
      },
      templateKey: "arrival_nudge",
      body: `Re-send: ${guest} (${event.partySize}) ${event.direction}. Acknowledge and set the pickup time.`,
      arrivalEventId: event.id,
      correlationId: event.correlationId,
      operatorId: operator.id,
    });
    return { ok: true, resent: id !== null };
  },
});
