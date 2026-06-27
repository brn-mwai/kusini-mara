import { v } from "convex/values";
import { lodgeMutation, lodgeQuery } from "./lib/tenancy";
import { newCorrelationId, recordEvent } from "./lib/events";
import type { Id } from "./_generated/dataModel";

// Lodge view of bookings (thin PMS references it owns).
export const list = lodgeQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .order("desc")
      .collect();
  },
});

// Create a booking → spawns the two movements it implies (arrival + departure),
// each as `requested` with no flight yet. The airline picks them up later.
export const create = lodgeMutation({
  args: {
    guest: v.string(),
    pax: v.number(),
    externalRef: v.string(),
    arrivalDate: v.number(),
    departureDate: v.number(),
    arrivalAirstrip: v.string(),
    departureAirstrip: v.string(),
    special: v.optional(v.array(v.string())),
  },
  returns: v.object({
    bookingId: v.id("bookings"),
    arrivalMovementId: v.id("movements"),
    departureMovementId: v.id("movements"),
  }),
  handler: async (ctx, args) => {
    // Resolve the airline contracted to this lodge (one per lodge in the pilot).
    const link = await ctx.db
      .query("airlineLodgeLinks")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .first();
    if (!link) throw new Error("No airline is linked to this lodge yet");
    const airlineId = link.airlineId;

    const bookingId = await ctx.db.insert("bookings", {
      lodgeId: ctx.org._id,
      guest: args.guest,
      pax: args.pax,
      externalRef: args.externalRef,
      arrivalDate: args.arrivalDate,
      departureDate: args.departureDate,
      arrivalAirstrip: args.arrivalAirstrip,
      departureAirstrip: args.departureAirstrip,
    });

    const special = args.special ?? [];
    const spawn = async (
      dir: "arrival" | "departure",
      airstrip: string,
      time: number,
    ): Promise<Id<"movements">> => {
      const correlationId = newCorrelationId();
      const movementId = await ctx.db.insert("movements", {
        bookingId,
        direction: dir,
        lodgeId: ctx.org._id,
        airlineId,
        airstrip,
        guestName: args.guest,
        pax: args.pax,
        special,
        scheduledTime: time,
        status: "requested",
        reconfirmRequested: false,
        correlationId,
      });
      await recordEvent(ctx, {
        correlationId,
        lodgeId: ctx.org._id,
        airlineId,
        type: "movement_requested",
        summary: `${dir} movement requested for ${args.guest} (${args.pax} pax) at ${airstrip}`,
        movementId,
        byUserId: ctx.user._id,
      });
      return movementId;
    };

    const arrivalMovementId = await spawn(
      "arrival",
      args.arrivalAirstrip,
      args.arrivalDate,
    );
    const departureMovementId = await spawn(
      "departure",
      args.departureAirstrip,
      args.departureDate,
    );

    return { bookingId, arrivalMovementId, departureMovementId };
  },
});
