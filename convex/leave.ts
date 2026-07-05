import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps, withId } from "./lib/base";

const DAY_MS = 86_400_000;

const datesBetween = (start: string, end: string): string[] => {
  const out: string[] = [];
  let t = new Date(`${start}T00:00:00`).getTime();
  const endT = new Date(`${end}T00:00:00`).getTime();
  while (t <= endT) {
    out.push(new Date(t).toISOString().slice(0, 10));
    t += DAY_MS;
  }
  return out;
};

export const board = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [staff, requests, plan, rules] = await Promise.all([
      ctx.db
        .query("staff")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("leaveRequests")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("leavePlan")
        .withIndex("by_property_and_date", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("coverageRules")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const activeStaff = staff.filter((s) => s.active && s.archivedAt === undefined);

    // remaining is DERIVED: allowed − taken (never stored) — master schema §9.
    const balances = activeStaff.map((s) => {
      const taken = plan.filter(
        (p) =>
          p.staffId === s.id &&
          p.leaveYear === year &&
          (p.status === "approved" || p.status === "taken" || p.status === "locked"),
      ).length;
      return {
        staffId: s.id,
        name: `${s.name.firstName} ${s.name.lastName}`.trim(),
        role: s.role,
        allowed: s.allowedLeaveDays,
        taken,
        remaining: s.allowedLeaveDays - taken,
      };
    });

    const requestRows = requests
      .map((r) => {
        const s = staff.find((st) => st.id === r.staffId);
        return {
          id: r.id,
          staffId: r.staffId,
          staffName: s ? `${s.name.firstName} ${s.name.lastName}`.trim() : "—",
          role: s?.role ?? null,
          startDate: r.startDate,
          endDate: r.endDate,
          days: r.days,
          status: r.status,
          reason: r.reason ?? null,
          conflict: (r.conflictFlags as { warning?: string } | undefined)?.warning ?? null,
        };
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate));

    return {
      balances,
      requests: requestRows,
      staffOptions: activeStaff.map((s) => ({
        id: s.id,
        label: `${s.name.firstName} ${s.name.lastName}`.trim(),
      })),
      coverageRules: rules.map((r) => ({ role: r.role, minStaff: r.minStaff })),
    };
  },
});

// Coverage check at request time: for each requested day, would approving drop
// any role below its coverage minimum? Warning recorded on the request.
export const request = mutation({
  args: {
    staffId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property } = await getDemoLodge(ctx);
    if (args.endDate < args.startDate) throw new Error("End must be on or after start.");

    const days = datesBetween(args.startDate, args.endDate);
    if (days.length > 60) throw new Error("Request too long (max 60 days).");

    const staffRow = await ctx.db
      .query("staff")
      .withIndex("by_portable_id", (q) => q.eq("id", args.staffId))
      .first();
    if (!staffRow || staffRow.propertyId !== property.id) {
      throw new Error("Staff not found.");
    }

    const year = Number(args.startDate.slice(0, 4));
    const [plan, rules, allStaff] = await Promise.all([
      ctx.db
        .query("leavePlan")
        .withIndex("by_property_and_date", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("coverageRules")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("staff")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const taken = plan.filter(
      (p) => p.staffId === args.staffId && p.leaveYear === year && p.status !== "cancelled",
    ).length;
    if (taken + days.length > staffRow.allowedLeaveDays) {
      throw new Error(
        `${days.length} days exceeds remaining balance (${staffRow.allowedLeaveDays - taken} left).`,
      );
    }

    const rule = rules.find((r) => r.role === staffRow.role);
    let warning: string | undefined;
    if (rule) {
      const sameRole = allStaff.filter(
        (s) => s.role === staffRow.role && s.active && s.archivedAt === undefined,
      );
      for (const day of days) {
        const onLeave = plan.filter(
          (p) =>
            p.date === day &&
            p.status !== "cancelled" &&
            sameRole.some((s) => s.id === p.staffId),
        ).length;
        const available = sameRole.length - onLeave - 1;
        if (available < rule.minStaff) {
          warning = `${day}: only ${available} ${staffRow.role}(s) left, minimum is ${rule.minStaff}.`;
          break;
        }
      }
    }

    const now = Date.now();
    const row = withStamps(
      {
        staffId: args.staffId,
        propertyId: property.id,
        startDate: args.startDate,
        endDate: args.endDate,
        days: days.length,
        leaveYear: year,
        status: "proposed" as const,
        reason: args.reason?.trim() || undefined,
        conflictFlags: warning ? { warning } : undefined,
      },
      now,
    );
    await ctx.db.insert("leaveRequests", row);
    return { id: row.id, warning: warning ?? null };
  },
});

export const decide = mutation({
  args: { requestId: v.string(), approve: v.boolean() },
  handler: async (ctx, { requestId, approve }) => {
    const { property } = await getDemoLodge(ctx);
    const req = await ctx.db
      .query("leaveRequests")
      .withIndex("by_portable_id", (q) => q.eq("id", requestId))
      .first();
    if (!req || req.propertyId !== property.id) throw new Error("Request not found.");
    if (req.status !== "proposed") throw new Error("Request already decided.");

    const now = Date.now();
    await ctx.db.patch(req._id, {
      status: approve ? "approved" : "cancelled",
      decidedAt: now,
    });

    if (approve) {
      for (const day of datesBetween(req.startDate, req.endDate)) {
        await ctx.db.insert(
          "leavePlan",
          withId(
            {
              staffId: req.staffId,
              propertyId: property.id,
              date: day,
              leaveYear: req.leaveYear,
              source: "manual" as const,
              status: "approved" as const,
              requestId: req.id,
            },
            now,
          ),
        );
      }
    }
    return { ok: true };
  },
});
