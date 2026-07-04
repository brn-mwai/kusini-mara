import { v } from "convex/values";
import {
  propertyMutation,
  propertyQuery,
  requirePropertyArrival,
} from "./lib/tenancy";
import { recordEvent } from "./lib/events";

export const list = propertyQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();
    return await Promise.all(
      rooms.map(async (r) => {
        const assigns = await ctx.db
          .query("roomAssignments")
          .withIndex("by_room", (q) => q.eq("roomId", r._id))
          .collect();
        return { ...r, assignedCount: assigns.length };
      }),
    );
  },
});

export const assignments = propertyQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("roomAssignments")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .order("desc")
      .collect();
    return await Promise.all(
      rows.map(async (a) => {
        const room = await ctx.db.get(a.roomId);
        const arrival = await ctx.db.get(a.arrivalId);
        return {
          ...a,
          roomName: room?.name ?? "—",
          roomType: room?.type ?? "",
          guestName: arrival?.guestName ?? a.guest,
        };
      }),
    );
  },
});

export const assign = propertyMutation({
  args: { arrivalId: v.id("arrivalEvents"), roomId: v.id("rooms"), guest: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const arrival = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    const room = await ctx.db.get(args.roomId);
    if (!room || room.propertyId !== ctx.property._id) throw new Error("Room not found");
    await ctx.db.insert("roomAssignments", {
      arrivalId: arrival._id,
      propertyId: ctx.property._id,
      roomId: room._id,
      guest: args.guest,
    });
    await recordEvent(ctx, {
      correlationId: arrival.correlationId,
      propertyId: ctx.property._id,
      airlineId: arrival.airlineId,
      type: "room_assigned",
      summary: `${args.guest} placed in ${room.name}`,
      arrivalId: arrival._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});
