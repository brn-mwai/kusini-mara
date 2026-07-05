import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { bookingSource } from "./schema.master.foundation";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps, withId } from "./lib/base";
import { ulid } from "./lib/ids";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [bookings, events] = await Promise.all([
      ctx.db
        .query("bookings")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (q) =>
          q.eq("destinationPropertyId", property.id),
        )
        .collect(),
    ]);

    const rows = bookings
      .filter((b) => b.archivedAt === undefined)
      .map((b) => {
        const movements = events.filter((e) => e.bookingId === b.id);
        return {
          id: b.id,
          guestName: b.guestName,
          partySize: b.partySize,
          source: b.source,
          arrivalDate: b.arrivalDate,
          departureDate: b.departureDate,
          externalRef: b.externalRef ?? null,
          specialNeeds: b.specialNeeds ?? null,
          movements: movements.map((m) => ({
            id: m.id,
            direction: m.direction,
            status: m.status,
          })),
        };
      })
      .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));

    return { property: { id: property.id, name: property.name }, rows };
  },
});

// A booking spawns two movements: the arrival and the departure (§6 of the
// master schema). Times default to 11h00 on each date; the carrier refines later.
export const create = mutation({
  args: {
    guestName: v.string(),
    partySize: v.number(),
    arrivalDate: v.string(),
    departureDate: v.string(),
    source: bookingSource,
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.guestName.trim() === "") throw new Error("Guest name is required.");
    if (args.partySize < 1) throw new Error("Party size must be at least 1.");
    if (args.departureDate < args.arrivalDate) {
      throw new Error("Departure must be on or after arrival.");
    }

    const now = Date.now();
    const booking = withStamps(
      {
        propertyId: property.id,
        operatorId: operator.id,
        guestName: args.guestName.trim(),
        partySize: args.partySize,
        source: args.source,
        arrivalDate: args.arrivalDate,
        departureDate: args.departureDate,
        specialNeeds: args.specialNeeds?.trim() || undefined,
      },
      now,
    );
    await ctx.db.insert("bookings", booking);

    const spawnMovement = async (
      direction: "arrival" | "departure",
      date: string,
    ) => {
      const correlationId = ulid(now);
      const row = withStamps(
        {
          bookingId: booking.id,
          direction,
          mode: "charter" as const,
          destinationPropertyId: property.id,
          partySize: args.partySize,
          guestNames: [args.guestName.trim()],
          scheduledTime: new Date(`${date}T11:00:00`).getTime(),
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
    };

    await spawnMovement("arrival", args.arrivalDate);
    await spawnMovement("departure", args.departureDate);

    return { id: booking.id };
  },
});
