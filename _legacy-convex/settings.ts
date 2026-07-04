import { v } from "convex/values";
import { propertyQuery } from "./lib/tenancy";

// Real property configuration for the Settings page: operator, property, the
// designated contacts, coverage rules, and live counts.
export const get = propertyQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const p = ctx.property;
    const dutyContact = p.dutyContactId ? await ctx.db.get(p.dutyContactId) : null;
    const backupContact = p.backupContactId ? await ctx.db.get(p.backupContactId) : null;
    const coverage = await ctx.db
      .query("coverageRules")
      .withIndex("by_property", (q) => q.eq("propertyId", p._id))
      .collect();
    const count = async (table: "staff" | "vehicles" | "rooms" | "arrivalEvents") =>
      (await ctx.db.query(table).withIndex("by_property", (q) => q.eq("propertyId", p._id)).collect()).length;

    return {
      operator: ctx.operator ? { name: ctx.operator.name, shortCode: ctx.operator.shortCode } : null,
      property: {
        name: p.name, region: p.region, shortCode: p.shortCode, timezone: p.timezone,
        carryOverPolicy: p.carryOverPolicy ?? "carry_capped", carryOverCapDays: p.carryOverCapDays ?? 0,
      },
      dutyContact: dutyContact ? { name: dutyContact.name, phone: dutyContact.phoneE164 ?? "—", role: dutyContact.role } : null,
      backupContact: backupContact ? { name: backupContact.name, phone: backupContact.phoneE164 ?? "—", role: backupContact.role } : null,
      coverage: coverage.map((c) => ({ role: c.role, minStaff: c.minStaff, peakMinStaff: c.peakMinStaff ?? c.minStaff })),
      counts: {
        staff: await count("staff"), vehicles: await count("vehicles"),
        rooms: await count("rooms"), arrivals: await count("arrivalEvents"),
      },
    };
  },
});
