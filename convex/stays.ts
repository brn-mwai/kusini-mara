import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { stayStatus } from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps } from "./lib/base";

const CHECKIN_READY = ["clean", "inspected"];

export const board = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [stays, rooms, bookings] = await Promise.all([
      ctx.db
        .query("stays")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("rooms")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("bookings")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const rows = stays
      .filter((s) => s.archivedAt === undefined)
      .map((s) => {
        const room = rooms.find((r) => r.id === s.roomId);
        const booking = bookings.find((b) => b.id === s.bookingId);
        return {
          id: s.id,
          guest: booking?.guestName ?? "Guest",
          roomId: s.roomId ?? null,
          roomName: room?.name ?? null,
          roomReady: room ? CHECKIN_READY.includes(room.housekeepingStatus) : false,
          plannedCheckIn: s.plannedCheckIn,
          plannedCheckOut: s.plannedCheckOut,
          status: s.status,
          boardBasis: s.boardBasis,
          heads: s.adults + s.children + s.infants,
          occasion: s.occasion,
        };
      })
      .sort((a, b) => a.plannedCheckIn.localeCompare(b.plannedCheckIn));

    const roomOptions = rooms
      .filter((r) => r.active)
      .map((r) => ({
        id: r.id,
        label: `${r.name} (${r.capacity})`,
        ready: CHECKIN_READY.includes(r.housekeepingStatus),
      }));
    const bookingOptions = bookings
      .filter((b) => b.archivedAt === undefined)
      .map((b) => ({ id: b.id, label: `${b.guestName} (${b.arrivalDate})` }));

    return { rows, roomOptions, bookingOptions };
  },
});

export const create = mutation({
  args: {
    bookingId: v.string(),
    roomId: v.optional(v.string()),
  },
  handler: async (ctx, { bookingId, roomId }) => {
    const { property } = await getDemoLodge(ctx);
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_portable_id", (q) => q.eq("id", bookingId))
      .first();
    if (!booking || booking.propertyId !== property.id) {
      throw new Error("Booking not found.");
    }

    const now = Date.now();
    const stay = withStamps(
      {
        bookingId,
        propertyId: property.id,
        roomId,
        plannedCheckIn: booking.arrivalDate,
        plannedCheckOut: booking.departureDate,
        status: "reserved" as const,
        boardBasis: "full_board" as const,
        adults: booking.partySize,
        children: 0,
        infants: 0,
        occasion: "none" as const,
      },
      now,
    );
    await ctx.db.insert("stays", stay);
    return { id: stay.id };
  },
});

export const assignRoom = mutation({
  args: { stayId: v.string(), roomId: v.string() },
  handler: async (ctx, { stayId, roomId }) => {
    const { property } = await getDemoLodge(ctx);
    const stay = await ctx.db
      .query("stays")
      .withIndex("by_portable_id", (q) => q.eq("id", stayId))
      .first();
    if (!stay || stay.propertyId !== property.id) throw new Error("Stay not found.");
    await ctx.db.patch(stay._id, { roomId, updatedAt: Date.now() });
    return { ok: true };
  },
});

// Lifecycle: reserved → due_in → checked_in → in_house → due_out → checked_out.
// Check-in requires the room to be clean/inspected (§12 of the master schema).
export const transition = mutation({
  args: { stayId: v.string(), to: stayStatus },
  handler: async (ctx, { stayId, to }) => {
    const { property } = await getDemoLodge(ctx);
    const stay = await ctx.db
      .query("stays")
      .withIndex("by_portable_id", (q) => q.eq("id", stayId))
      .first();
    if (!stay || stay.propertyId !== property.id) throw new Error("Stay not found.");

    const allowed: Record<string, string[]> = {
      reserved: ["due_in", "cancelled", "no_show"],
      due_in: ["checked_in", "no_show", "cancelled"],
      checked_in: ["in_house"],
      in_house: ["due_out"],
      due_out: ["checked_out"],
    };
    if (!allowed[stay.status]?.includes(to)) {
      throw new Error(`Cannot go from ${stay.status} to ${to}.`);
    }

    if (to === "checked_in") {
      if (!stay.roomId) throw new Error("Assign a room before check-in.");
      const room = await ctx.db
        .query("rooms")
        .withIndex("by_portable_id", (q) => q.eq("id", stay.roomId!))
        .first();
      if (!room || !CHECKIN_READY.includes(room.housekeepingStatus)) {
        throw new Error(
          `${room?.name ?? "Room"} is not ready (housekeeping: ${room?.housekeepingStatus ?? "unknown"}).`,
        );
      }
    }

    const now = Date.now();
    await ctx.db.patch(stay._id, {
      status: to,
      actualCheckInAt: to === "checked_in" ? now : stay.actualCheckInAt,
      actualCheckOutAt: to === "checked_out" ? now : stay.actualCheckOutAt,
      updatedAt: now,
    });
    return { ok: true };
  },
});
