import { v } from "convex/values";
import { propertyQuery } from "./lib/tenancy";

const DAY = 86400000;

export const list = propertyQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();
    const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
    return await Promise.all(
      staff.map(async (s) => {
        const leaves = await ctx.db
          .query("leaveDays")
          .withIndex("by_staff", (q) => q.eq("staffId", s._id))
          .collect();
        const taken = leaves.filter((l) => l.date >= yearStart).length;
        return { ...s, taken, remaining: s.allowedDays - taken };
      }),
    );
  },
});

export const vehicles = propertyQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("vehicles")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .collect();
  },
});
