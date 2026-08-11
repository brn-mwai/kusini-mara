import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireStaff } from "./lib/auth";

// Public integration surface: the partner drop-off platform reads active,
// publicly-listed points from here. No CycleTrack UI consumes this directly.
export const listPublicPoints = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("points")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return rows
      .filter((p) => p.isPublic)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        hours: p.hours,
        acceptedItems: p.acceptedItems,
        prohibitedItems: p.prohibitedItems,
        photoUrl: p.photoUrl ?? null,
      }));
  },
});

export const listPointsForStaff = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const points = await ctx.db.query("points").collect();
    const containers = await ctx.db.query("containers").collect();
    return points.map((p) => {
      const onSite = containers.filter((c) => c.pointId === p._id);
      return {
        _id: p._id,
        name: p.name,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        hours: p.hours,
        acceptedItems: p.acceptedItems,
        prohibitedItems: p.prohibitedItems,
        isPublic: p.isPublic,
        active: p.active,
        containerCount: onSite.length,
        fillPct:
          onSite.length > 0
            ? Math.max(...onSite.map((c) => c.fillPct))
            : null,
      };
    });
  },
});

export const setPointActive = mutation({
  args: { pointId: v.id("points"), active: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    await ctx.db.patch(args.pointId, { active: args.active });
  },
});

export const setPointPublic = mutation({
  args: { pointId: v.id("points"), isPublic: v.boolean() },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    await ctx.db.patch(args.pointId, { isPublic: args.isPublic });
  },
});
