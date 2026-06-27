import { v } from "convex/values";
import { lodgeMutation, lodgeQuery, requireLodgeStaff } from "./lib/tenancy";

const DAY = 86400000;

// Leave planner grid for the caller's lodge over a window starting at startDate
// (a day-start ms supplied by the client, since queries can't read the clock).
// Returns each staff member's leave day-indices, weekend flags, and a per-day
// coverage count (available staff). `minCoverage` flags thin days.
export const grid = lodgeQuery({
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

    const staff = await ctx.db
      .query("staff")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .collect();
    const leaves = await ctx.db
      .query("leaveDays")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .collect();

    const dayIndex = (d: number) => Math.floor((d - start) / DAY);
    const leaveByStaff = new Map<string, Set<number>>();
    for (const l of leaves) {
      if (l.date < start || l.date >= end) continue;
      const set = leaveByStaff.get(l.staffId) ?? new Set<number>();
      set.add(dayIndex(l.date));
      leaveByStaff.set(l.staffId, set);
    }

    const days = Array.from({ length: dayCount }, (_, i) => {
      const ms = start + i * DAY;
      const dow = new Date(ms).getDay();
      return { index: i, ms, weekend: dow === 0 || dow === 6 };
    });

    const rows = staff.map((s) => ({
      id: s._id,
      name: s.name,
      role: s.role,
      leaveBalance: s.leaveBalance,
      entitlementDays: s.entitlementDays,
      leave: Array.from(leaveByStaff.get(s._id) ?? []),
    }));

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

// Toggle a single staff leave day on/off.
export const toggle = lodgeMutation({
  args: { staffId: v.id("staff"), date: v.number() },
  returns: v.object({ onLeave: v.boolean() }),
  handler: async (ctx, args) => {
    const staff = await requireLodgeStaff(ctx, ctx.org, args.staffId);
    const dayStart = Math.floor(args.date / DAY) * DAY;
    const existing = await ctx.db
      .query("leaveDays")
      .withIndex("by_staff_date", (q) =>
        q.eq("staffId", staff._id).eq("date", dayStart),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(staff._id, { leaveBalance: staff.leaveBalance + 1 });
      return { onLeave: false };
    }
    await ctx.db.insert("leaveDays", {
      lodgeId: ctx.org._id,
      staffId: staff._id,
      date: dayStart,
    });
    await ctx.db.patch(staff._id, {
      leaveBalance: Math.max(0, staff.leaveBalance - 1),
    });
    return { onLeave: true };
  },
});
