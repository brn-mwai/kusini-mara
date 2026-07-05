import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { staffRole } from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps } from "./lib/base";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const staff = await ctx.db
      .query("staff")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .collect();

    const rows = staff
      .filter((s) => s.archivedAt === undefined)
      .map((s) => ({
        id: s.id,
        name: `${s.name.firstName} ${s.name.lastName}`.trim(),
        role: s.role,
        phone: s.phones.primaryPhoneNumber,
        languages: s.languages,
        certifications: s.certifications,
        dailyDutyCap: s.dailyDutyCap,
        allowedLeaveDays: s.allowedLeaveDays,
        active: s.active,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { rows };
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    role: staffRole,
    phone: v.string(),
    languages: v.string(),
    allowedLeaveDays: v.number(),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.firstName.trim() === "" && args.lastName.trim() === "") {
      throw new Error("Name is required.");
    }
    if (args.phone.trim() === "") throw new Error("Phone is required (SMS target).");

    const now = Date.now();
    const row = withStamps(
      {
        propertyId: property.id,
        operatorId: operator.id,
        name: { firstName: args.firstName.trim(), lastName: args.lastName.trim() },
        phones: { primaryPhoneNumber: args.phone.trim() },
        role: args.role,
        certifications: [],
        languages: args.languages
          .split(",")
          .map((l) => l.trim().toUpperCase())
          .filter(Boolean),
        dailyDutyCap: 3,
        allowedLeaveDays: args.allowedLeaveDays,
        active: true,
      },
      now,
    );
    await ctx.db.insert("staff", row);
    return { id: row.id };
  },
});

export const setActive = mutation({
  args: { staffId: v.string(), active: v.boolean() },
  handler: async (ctx, { staffId, active }) => {
    const { property } = await getDemoLodge(ctx);
    const row = await ctx.db
      .query("staff")
      .withIndex("by_portable_id", (q) => q.eq("id", staffId))
      .first();
    if (!row || row.propertyId !== property.id) throw new Error("Staff not found.");
    await ctx.db.patch(row._id, { active, updatedAt: Date.now() });
    return { ok: true };
  },
});
