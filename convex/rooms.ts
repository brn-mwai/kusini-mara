import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { housekeepingStatus, roomType } from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps } from "./lib/base";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .collect();

    const rows = rooms
      .filter((r) => r.archivedAt === undefined)
      .map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        capacity: r.capacity,
        bedConfig: r.bedConfig,
        features: r.features,
        accessible: r.accessible,
        housekeepingStatus: r.housekeepingStatus,
        active: r.active,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { rows };
  },
});

export const setHousekeeping = mutation({
  args: { roomId: v.string(), status: housekeepingStatus },
  handler: async (ctx, { roomId, status }) => {
    const { property } = await getDemoLodge(ctx);
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_portable_id", (q) => q.eq("id", roomId))
      .first();
    if (!room || room.propertyId !== property.id) throw new Error("Room not found.");
    await ctx.db.patch(room._id, {
      housekeepingStatus: status,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: roomType,
    capacity: v.number(),
    bedConfig: v.string(),
    accessible: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { property } = await getDemoLodge(ctx);
    if (args.name.trim() === "") throw new Error("Room name is required.");
    if (args.capacity < 1) throw new Error("Capacity must be at least 1.");

    const now = Date.now();
    const room = withStamps(
      {
        propertyId: property.id,
        name: args.name.trim(),
        type: args.type,
        capacity: args.capacity,
        maxAdults: args.capacity,
        maxChildren: Math.max(0, args.capacity - 1),
        bedConfig: args.bedConfig.trim() || "1 king",
        features: [],
        accessible: args.accessible,
        housekeepingStatus: "clean" as const,
        active: true,
      },
      now,
    );
    await ctx.db.insert("rooms", room);
    return { id: room.id };
  },
});
