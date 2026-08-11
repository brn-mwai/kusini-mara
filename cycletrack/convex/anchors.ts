import { query } from "./_generated/server";
import { requireStaff } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const rows = await ctx.db.query("anchors").collect();
    return rows
      .sort((a, b) => b.periodStart - a.periodStart)
      .map((a) => ({
        _id: a._id,
        periodStart: a.periodStart,
        periodEnd: a.periodEnd,
        merkleRoot: a.merkleRoot,
        eventCount: a.eventCount,
        provider: a.provider,
        txId: a.txId ?? null,
        state: a.state,
      }));
  },
});
