import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getDemoLodge } from "./lib/tenancy";
import { withId } from "./lib/base";
import { enqueueNotification } from "./lib/notify";

import { type MutationCtx } from "./_generated/server";

type LodgeTenant = Awaited<ReturnType<typeof getDemoLodge>>;

async function acknowledgeEvent(
  ctx: MutationCtx,
  { property, operator }: LodgeTenant,
  arrivalEventId: string,
  confirmedPickupTime?: number,
) {
  const event = await ctx.db
    .query("arrivalEvents")
    .withIndex("by_portable_id", (q) => q.eq("id", arrivalEventId))
    .first();
  if (!event) throw new Error("Movement not found.");
  if (event.destinationPropertyId !== property.id) {
    throw new Error("Cross-tenant acknowledgment refused.");
  }

  let userId = property.dutyContactUserId;
  if (!userId) {
    const anyUser = await ctx.db
      .query("users")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .first();
    userId = anyUser?.id;
  }
  if (!userId) throw new Error("No duty contact to acknowledge as.");

  const now = Date.now();
  const isReconfirm = event.status === "reconfirm_required";
  const pickupTime = confirmedPickupTime ?? event.confirmedPickupTime ?? event.proposedPickupTime;

  await ctx.db.insert(
    "acknowledgments",
    withId({
      arrivalEventId: event.id,
      bySide: event.assignedToSide,
      userId,
      pickupTimeSet: pickupTime,
      type: isReconfirm ? "reconfirm" : "initial",
      channel: "push" as const,
      at: now,
      propertyId: property.id,
      operatorId: operator.id,
    }),
  );

  await ctx.db.insert(
    "transferEvents",
    withId({
      arrivalEventId: event.id,
      correlationId: event.correlationId,
      actorUserId: userId,
      action: "acknowledged",
      fromStatus: event.status,
      toStatus: "acknowledged",
      at: now,
      operatorId: operator.id,
    }),
  );

  // Clear the escalation deadline so the sweep can never fire on an acked movement.
  await ctx.db.patch(event._id, {
    status: "acknowledged",
    confirmedPickupTime: pickupTime,
    escalationDeadline: undefined,
    updatedAt: now,
  });

  return { event, pickupTime };
}

// One-tap acknowledgment — the product. The assigned side confirms receipt and
// sets the pickup time; writes the ack record + audit event, flips status, clears
// the escalation deadline, and nudges the poster. Tenant-guarded to the property.
export const one = mutation({
  args: {
    arrivalEventId: v.string(),
    confirmedPickupTime: v.optional(v.number()),
  },
  handler: async (ctx, { arrivalEventId, confirmedPickupTime }) => {
    const tenant = await getDemoLodge(ctx);
    const { event, pickupTime } = await acknowledgeEvent(
      ctx,
      tenant,
      arrivalEventId,
      confirmedPickupTime,
    );

    const poster = tenant.property.dutyContactUserId
      ? await ctx.db
          .query("users")
          .withIndex("by_portable_id", (q) =>
            q.eq("id", tenant.property.dutyContactUserId!),
          )
          .first()
      : null;
    const guest = event.guestNames?.[0] ?? "party";
    await enqueueNotification(ctx, {
      recipient: {
        userId: poster?.id,
        telegramChatId: poster?.telegramChatId,
        phone: poster?.phones.primaryPhoneNumber,
      },
      templateKey: "ack_confirmed",
      body: `${guest} acknowledged${pickupTime ? "; pickup time set" : ""}.`,
      arrivalEventId: event.id,
      correlationId: event.correlationId,
      operatorId: tenant.operator.id,
    });

    return { ok: true, status: "acknowledged" as const };
  },
});

// Bulk acknowledgment for table selection.
export const many = mutation({
  args: { arrivalEventIds: v.array(v.string()) },
  handler: async (ctx, { arrivalEventIds }) => {
    const tenant = await getDemoLodge(ctx);
    for (const id of arrivalEventIds) {
      await acknowledgeEvent(ctx, tenant, id);
    }
    return { ok: true, count: arrivalEventIds.length };
  },
});
