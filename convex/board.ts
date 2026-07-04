import { query } from "./_generated/server";
import { getDemoLodge } from "./lib/tenancy";
import { NEEDS_ACK } from "./lib/base";

// The Lodge board: today's movements, unacknowledged first. Renders into Twenty's
// record-table layout. (Read-model board_projections comes later; this reads live.)
export const today = query({
  args: {},
  handler: async (ctx) => {
    const { property } = await getDemoLodge(ctx);
    const events = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_property_and_date", (q) =>
        q.eq("destinationPropertyId", property.id),
      )
      .collect();

    const rows = events
      .filter((e) => e.archivedAt === undefined && e.status !== "cancelled")
      .map((e) => ({
        id: e.id,
        guest: e.guestNames?.[0] ?? "Guest",
        partySize: e.partySize,
        direction: e.direction,
        mode: e.mode,
        carrier: e.carrierName ?? null,
        scheduledTime: e.scheduledTime ?? null,
        status: e.status,
        needsAck: NEEDS_ACK.includes(e.status),
        acknowledgedAt: e.status === "acknowledged" ? e.updatedAt : null,
      }));

    // unacked first, then by scheduled time
    rows.sort((a, b) => {
      if (a.needsAck !== b.needsAck) return a.needsAck ? -1 : 1;
      return (a.scheduledTime ?? Infinity) - (b.scheduledTime ?? Infinity);
    });

    const kpis = {
      total: rows.length,
      needsAck: rows.filter((r) => r.needsAck).length,
      arrivals: rows.filter((r) => r.direction === "arrival").length,
      departures: rows.filter((r) => r.direction === "departure").length,
      escalated: rows.filter((r) => r.status === "escalated").length,
    };

    return { property: { id: property.id, name: property.name }, kpis, rows };
  },
});
