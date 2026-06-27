import { v } from "convex/values";
import { orgQuery } from "./lib/tenancy";

// Recent transfer events for the caller's org, newest first. The event log is
// the single correlation-linked source of truth for what happened.
export const recent = orgQuery({
  args: { limit: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const isLodge = ctx.org.type === "lodge";
    const index = isLodge ? "by_lodge" : "by_airline";
    const rows = await ctx.db
      .query("transferEvents")
      .withIndex(index, (q) =>
        isLodge
          ? q.eq("lodgeId", ctx.org._id)
          : q.eq("airlineId", ctx.org._id),
      )
      .order("desc")
      .take(args.limit ?? 50);
    return rows;
  },
});

// All events for one correlation id (a single movement's full timeline).
export const byCorrelation = orgQuery({
  args: { correlationId: v.string() },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("transferEvents")
      .withIndex("by_correlation", (q) =>
        q.eq("correlationId", args.correlationId),
      )
      .order("asc")
      .collect();
    return rows.filter(
      (e) => e.lodgeId === ctx.org._id || e.airlineId === ctx.org._id,
    );
  },
});
