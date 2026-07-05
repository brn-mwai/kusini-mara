import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { staffRole } from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withId } from "./lib/base";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property, operator } = tenant;

    const [users, rules] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("coverageRules")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    return {
      property: {
        id: property.id,
        name: property.name,
        region: property.region,
        timezone: property.timezone,
        escalationWindowMinutes: property.escalationWindowMinutes,
        defaultReportOffsetMinutes: property.defaultReportOffsetMinutes,
        dutyContactUserId: property.dutyContactUserId ?? null,
      },
      operator: { name: operator.name },
      users: users.map((u) => ({
        id: u.id,
        name: `${u.name.firstName} ${u.name.lastName}`.trim(),
        role: u.role,
      })),
      coverageRules: rules.map((r) => ({
        id: r.id,
        role: r.role,
        minStaff: r.minStaff,
        resilienceBuffer: r.resilienceBuffer,
      })),
    };
  },
});

export const updateProperty = mutation({
  args: {
    escalationWindowMinutes: v.number(),
    defaultReportOffsetMinutes: v.number(),
    dutyContactUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property } = await getDemoLodge(ctx);
    if (args.escalationWindowMinutes < 10) {
      throw new Error("Escalation window must be at least 10 minutes.");
    }
    if (args.defaultReportOffsetMinutes < 0) {
      throw new Error("Report offset cannot be negative.");
    }
    const doc = await ctx.db
      .query("properties")
      .withIndex("by_portable_id", (q) => q.eq("id", property.id))
      .first();
    if (!doc) throw new Error("Property not found.");
    await ctx.db.patch(doc._id, {
      escalationWindowMinutes: args.escalationWindowMinutes,
      defaultReportOffsetMinutes: args.defaultReportOffsetMinutes,
      dutyContactUserId: args.dutyContactUserId,
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const setCoverageRule = mutation({
  args: { role: staffRole, minStaff: v.number() },
  handler: async (ctx, { role, minStaff }) => {
    const { property } = await getDemoLodge(ctx);
    if (minStaff < 0) throw new Error("Minimum cannot be negative.");

    const rules = await ctx.db
      .query("coverageRules")
      .withIndex("by_property_role", (q) =>
        q.eq("propertyId", property.id).eq("role", role),
      )
      .collect();

    if (rules.length > 0) {
      await ctx.db.patch(rules[0]._id, { minStaff });
    } else {
      await ctx.db.insert(
        "coverageRules",
        withId({
          propertyId: property.id,
          role,
          minStaff,
          resilienceBuffer: 1,
        }),
      );
    }
    return { ok: true };
  },
});
