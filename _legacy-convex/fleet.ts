import { v } from "convex/values";
import { airlineQuery } from "./lib/tenancy";

export const aircraft = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("aircraft")
      .withIndex("by_airline", (q) => q.eq("airlineId", ctx.airline._id))
      .collect();
  },
});

export const pilots = airlineQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("pilots")
      .withIndex("by_airline", (q) => q.eq("airlineId", ctx.airline._id))
      .collect();
  },
});
