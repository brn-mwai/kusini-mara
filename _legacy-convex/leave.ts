import { v } from "convex/values";
import {
  propertyMutation,
  propertyQuery,
  requirePropertyStaff,
} from "./lib/tenancy";

const DAY = 86400000;

// Leave planner grid over a window starting at startDate (a day-start ms from
// the client). Remaining is derived (allowed − taken this leave year), never
// stored. Returns per-staff leave day-indices + per-day coverage.
export const grid = propertyQuery({
  args: {
    startDate: v.number(),
    days: v.optional(v.number()),
    minCoverage: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const dayCount = args.days ?? 30;
    const minCoverage = args.minCoverage ?? 3;
    const start = args.startDate;
    const end = start + dayCount * DAY;
    const yearStart = new Date(new Date(start).getFullYear(), 0, 1).getTime();

    const staff = await ctx.db
      .query("staff")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();
    const leaves = await ctx.db
      .query("leaveDays")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();

    const dayIndex = (d: number) => Math.floor((d - start) / DAY);
    const windowByStaff = new Map<string, Set<number>>();
    const takenByStaff = new Map<string, number>();
    for (const l of leaves) {
      if (l.date >= yearStart) takenByStaff.set(l.staffId, (takenByStaff.get(l.staffId) ?? 0) + 1);
      if (l.date < start || l.date >= end) continue;
      const set = windowByStaff.get(l.staffId) ?? new Set<number>();
      set.add(dayIndex(l.date));
      windowByStaff.set(l.staffId, set);
    }

    const days = Array.from({ length: dayCount }, (_, i) => {
      const ms = start + i * DAY;
      const dow = new Date(ms).getDay();
      return { index: i, ms, weekend: dow === 0 || dow === 6 };
    });

    const rows = staff.map((s) => {
      const taken = takenByStaff.get(s._id) ?? 0;
      return {
        id: s._id,
        name: s.name,
        role: s.role,
        allowedDays: s.allowedDays,
        taken,
        remaining: s.allowedDays - taken,
        leave: Array.from(windowByStaff.get(s._id) ?? []),
      };
    });

    const coverage = days.map((d) => {
      const onLeave = rows.filter((r) => r.leave.includes(d.index)).length;
      const available = staff.length - onLeave;
      return { index: d.index, available, short: available < minCoverage };
    });

    return {
      days,
      rows,
      coverage,
      minCoverage,
      shortDays: coverage.filter((c) => c.short).length,
      staffCount: staff.length,
    };
  },
});

export const toggle = propertyMutation({
  args: { staffId: v.id("staff"), date: v.number() },
  returns: v.object({ onLeave: v.boolean() }),
  handler: async (ctx, args) => {
    const staff = await requirePropertyStaff(ctx, ctx.property, args.staffId);
    const dayStart = Math.floor(args.date / DAY) * DAY;
    const existing = await ctx.db
      .query("leaveDays")
      .withIndex("by_staff_date", (q) =>
        q.eq("staffId", staff._id).eq("date", dayStart),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { onLeave: false };
    }
    await ctx.db.insert("leaveDays", {
      propertyId: ctx.property._id,
      staffId: staff._id,
      date: dayStart,
      leaveYear: new Date(dayStart).getFullYear(),
      source: "manual",
    });
    return { onLeave: true };
  },
});
