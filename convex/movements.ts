import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  eventDirection,
  transportMode,
} from "./schema.master.foundation";
import { withStamps, withId } from "./lib/base";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { ulid } from "./lib/ids";

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
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.partySize < 1) throw new Error("Party size must be at least 1.");
    if (args.guestName.trim() === "") throw new Error("Guest name is required.");

    const now = Date.now();
    const correlationId = ulid(now);

    const row = withStamps(
      {
        direction: args.direction,
        mode: args.mode,
        destinationPropertyId: property.id,
        carrierName: args.carrierName?.trim() || undefined,
        partySize: args.partySize,
        guestNames: [args.guestName.trim()],
        specialNeeds: args.specialNeeds?.trim() || undefined,
        scheduledTime: args.scheduledTime,
        guestReportOffsetMinutes: property.defaultReportOffsetMinutes,
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
