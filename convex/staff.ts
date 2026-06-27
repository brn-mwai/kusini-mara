import { v } from "convex/values";
import { lodgeQuery } from "./lib/tenancy";

export const list = lodgeQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db
      .query("staff")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .collect();
  },
});
