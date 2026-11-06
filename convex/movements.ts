import { v } from "convex/values";

import { mutation, query, type MutationCtx } from "./_generated/server";
import {
  eventDirection,
  transportMode,
} from "./schema.master.foundation";
import { withStamps, withId } from "./lib/base";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { enqueueNotification } from "./lib/notify";
import { ulid } from "./lib/ids";

// The assigned side owes the acknowledgment: on an arrival the airstrip, on a
// departure the lodge (master-spec §15.3). Demo posture posts from the lodge.
function assignedSide(direction: "arrival" | "departure"): "lodge" | "airstrip" {
  return direction === "arrival" ? "airstrip" : "lodge";
}

// Resolve the primary strip handler for a property, for the notify-on-post nudge.
async function primaryHandler(ctx: MutationCtx, propertyId: string, airstripId?: string) {
  let stripId = airstripId;
  if (!stripId) {
    const link = await ctx.db
      .query("propertyAirstrips")
      .withIndex("by_property", (q) => q.eq("propertyId", propertyId))
      .first();
    stripId = link?.airstripId;
  }
  if (!stripId) return null;
  const handler = await ctx.db
    .query("airstripContacts")
    .withIndex("by_airstrip", (q) => q.eq("airstripId", stripId!))
    .first();
  if (!handler) return { airstripId: stripId, recipient: null };
  return {
    airstripId: stripId,
    recipient: {
      airstripContactId: handler.id,
      telegramChatId: handler.telegramChatId,
      phone: handler.phones.primaryPhoneNumber,
    },
  };
}

// Lodge-side manual entry: posts a movement onto the board (dual-entry — the
// lodge is the creating party; a carrier can claim/enrich it later).
export const create = mutation({
  args: {
    guestName: v.string(),
    partySize: v.number(),
    direction: eventDirection,
    mode: transportMode,
    scheduledTime: v.number(),
    carrierName: v.optional(v.string()),
    airstripId: v.optional(v.string()),
    proposedPickupTime: v.optional(v.number()),
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.partySize < 1) throw new Error("Party size must be at least 1.");
    if (args.guestName.trim() === "") throw new Error("Guest name is required.");

    const now = Date.now();
    const correlationId = ulid(now);
    const handler = await primaryHandler(ctx, property.id, args.airstripId);
    const pickupTarget = args.proposedPickupTime ?? args.scheduledTime;
    const escalationDeadline = pickupTarget - property.escalationWindowMinutes * 60_000;

    const row = withStamps(
      {
        direction: args.direction,
        mode: args.mode,
        destinationPropertyId: property.id,
        airstripId: handler?.airstripId,
        carrierName: args.carrierName?.trim() || undefined,
        partySize: args.partySize,
        guestNames: [args.guestName.trim()],
        specialNeeds: args.specialNeeds?.trim() || undefined,
        scheduledTime: args.scheduledTime,
        guestReportOffsetMinutes: property.defaultReportOffsetMinutes,
        postedBySide: "lodge" as const,
        assignedToSide: assignedSide(args.direction),
        proposedPickupTime: args.proposedPickupTime,
        escalationDeadline,
        status: "posted" as const,
        correlationId,
        createdByOrgId: operator.id,
        operatorId: operator.id,
        reprotectCount: 0,
      },
      now,
    );
    await ctx.db.insert("arrivalEvents", row);

    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: row.id,
          correlationId,
          action: "posted",
          toStatus: "posted" as const,
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );

    if (handler?.recipient) {
      const guest = args.guestName.trim();
      await enqueueNotification(
        ctx,
        {
          recipient: handler.recipient,
          templateKey: "arrival_nudge",
          body: `New ${args.direction}: ${guest} (${args.partySize}). Acknowledge and set the pickup time.`,
          arrivalEventId: row.id,
          correlationId,
          operatorId: operator.id,
        },
        now,
      );
    }

    return { id: row.id };
  },
});

// Twenty-style create: an "Untitled" movement appears immediately; the record
// panel edits it in place.
export const createDraft = mutation({
  args: {},
  handler: async (ctx) => {
    const { property, operator } = await getDemoLodge(ctx);
    const now = Date.now();
    const correlationId = ulid(now);
    const row = withStamps(
      {
        direction: "arrival" as const,
        mode: "charter" as const,
        destinationPropertyId: property.id,
        partySize: 1,
        guestNames: ["Untitled"],
        scheduledTime: now + 2 * 3600_000,
        guestReportOffsetMinutes: property.defaultReportOffsetMinutes,
        postedBySide: "lodge" as const,
        assignedToSide: "airstrip" as const,
        escalationDeadline: now + 2 * 3600_000 - property.escalationWindowMinutes * 60_000,
        status: "posted" as const,
        correlationId,
        createdByOrgId: operator.id,
        operatorId: operator.id,
        reprotectCount: 0,
      },
      now,
    );
    await ctx.db.insert("arrivalEvents", row);
    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: row.id,
          correlationId,
          action: "posted",
          toStatus: "posted" as const,
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );
    return { id: row.id };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    guestName: v.optional(v.string()),
    partySize: v.optional(v.number()),
    direction: v.optional(eventDirection),
    mode: v.optional(transportMode),
    scheduledTime: v.optional(v.number()),
    carrierName: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const { property } = await getDemoLodge(ctx);
    const event = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_portable_id", (q) => q.eq("id", id))
      .first();
    if (!event || event.destinationPropertyId !== property.id) {
      throw new Error("Movement not found.");
    }
    if (patch.partySize !== undefined && patch.partySize < 1) {
      throw new Error("Party size must be at least 1.");
    }

    await ctx.db.patch(event._id, {
      ...(patch.guestName !== undefined && { guestNames: [patch.guestName] }),
      ...(patch.partySize !== undefined && { partySize: patch.partySize }),
      ...(patch.direction !== undefined && { direction: patch.direction }),
      ...(patch.mode !== undefined && { mode: patch.mode }),
      ...(patch.scheduledTime !== undefined && { scheduledTime: patch.scheduledTime }),
      ...(patch.carrierName !== undefined && {
        carrierName: patch.carrierName.trim() || undefined,
      }),
      ...(patch.specialNeeds !== undefined && {
        specialNeeds: patch.specialNeeds.trim() || undefined,
      }),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

// Re-protection: a carrier/strip/time change voids the prior acknowledgment and
// re-opens the handshake (master-spec §6). Bumps reprotectCount, resets the
// escalation deadline, writes the audit row, and re-notifies both sides.
export const reprotect = mutation({
  args: {
    id: v.string(),
    carrierName: v.optional(v.string()),
    carrierOpsContact: v.optional(v.string()),
    airstripId: v.optional(v.string()),
    scheduledTime: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    const event = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_portable_id", (q) => q.eq("id", args.id))
      .first();
    if (!event || event.destinationPropertyId !== property.id) {
      throw new Error("Movement not found.");
    }

    const now = Date.now();
    const newScheduled = args.scheduledTime ?? event.scheduledTime;
    const escalationDeadline = newScheduled
      ? newScheduled - property.escalationWindowMinutes * 60_000
      : undefined;

    await ctx.db.patch(event._id, {
      carrierName: args.carrierName?.trim() || event.carrierName,
      carrierOpsContact: args.carrierOpsContact?.trim() || event.carrierOpsContact,
      airstripId: args.airstripId ?? event.airstripId,
      scheduledTime: newScheduled,
      status: "reconfirm_required" as const,
      confirmedPickupTime: undefined,
      escalationDeadline,
      reprotectCount: event.reprotectCount + 1,
      lastReprotectedAt: now,
      lastTimingChangeAt: now,
      updatedAt: now,
    });

    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: event.id,
          correlationId: event.correlationId,
          action: "reprotected",
          fromStatus: event.status,
          toStatus: "reconfirm_required" as const,
          payload: {
            fromCarrier: event.carrierName,
            toCarrier: args.carrierName,
            reason: args.reason,
          },
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );

    const handler = await primaryHandler(ctx, property.id, event.airstripId);
    const guest = event.guestNames?.[0] ?? "party";
    if (handler?.recipient) {
      await enqueueNotification(ctx, {
        recipient: handler.recipient,
        templateKey: "reprotect",
        body: `Re-protected: ${guest} now on ${args.carrierName ?? event.carrierName ?? "new carrier"}. Re-acknowledge and set the pickup time.`,
        arrivalEventId: event.id,
        correlationId: event.correlationId,
        operatorId: operator.id,
      });
    }
    return { ok: true, reprotectCount: event.reprotectCount + 1 };
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const event = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_portable_id", (q) => q.eq("id", id))
      .first();
    if (!event || event.destinationPropertyId !== tenant.property.id) return null;

    const duty = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_event", (q) => q.eq("arrivalEventId", event.id))
      .first();
    let dutyStaffName: string | null = null;
    let dutyVehicleName: string | null = null;
    if (duty?.staffId) {
      const staff = await ctx.db
        .query("staff")
        .withIndex("by_portable_id", (q) => q.eq("id", duty.staffId!))
        .first();
      dutyStaffName = staff ? `${staff.name.firstName} ${staff.name.lastName}` : null;
    }
    if (duty?.vehicleId) {
      const vehicle = await ctx.db
        .query("vehicles")
        .withIndex("by_portable_id", (q) => q.eq("id", duty.vehicleId!))
        .first();
      dutyVehicleName = vehicle?.name ?? null;
    }

    return {
      id: event.id,
      guestName: event.guestNames?.[0] ?? "",
      guestNames: event.guestNames ?? [],
      partySize: event.partySize,
      direction: event.direction,
      mode: event.mode,
      scheduledTime: event.scheduledTime ?? null,
      carrierName: event.carrierName ?? "",
      specialNeeds: event.specialNeeds ?? "",
      status: event.status,
      createdAt: event.createdAt,
      dutyStaffName,
      dutyVehicleName,
    };
  },
});

// The record's Timeline tab: audit-spine events, newest first, actor resolved.
export const timeline = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;

    const [events, users] = await Promise.all([
      ctx.db
        .query("transferEvents")
        .withIndex("by_event", (q) => q.eq("arrivalEventId", id))
        .collect(),
      ctx.db
        .query("users")
        .withIndex("by_property", (q) => q.eq("propertyId", tenant.property.id))
        .collect(),
    ]);

    return {
      items: events
        .map((e) => {
          const actor = users.find((u) => u.id === e.actorUserId);
          return {
            id: e.id,
            action: e.action,
            fromStatus: e.fromStatus ?? null,
            toStatus: e.toStatus ?? null,
            actor: actor ? `${actor.name.firstName} ${actor.name.lastName}` : null,
            at: e.at,
          };
        })
        .sort((a, b) => b.at - a.at),
    };
  },
});
