import { query } from "./_generated/server";
import { getDemoLodgeOrNull } from "./lib/tenancy";

// Pilot grading metrics (Scope O1-O8): computed from the audit spine.
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [movements, acks, duties] = await Promise.all([
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (q) =>
          q.eq("destinationPropertyId", property.id),
        )
        .collect(),
      ctx.db
        .query("acknowledgments")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("dutyAssignments")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const now = Date.now();
    const live = movements.filter(
      (m) => m.archivedAt === undefined && m.status !== "cancelled",
    );

    const missedArrivals = live.filter(
      (m) => m.status === "escalated" && (m.scheduledTime ?? 0) < now,
    ).length;

    const ackLeads = acks
      .map((a) => {
        const m = movements.find((mm) => mm.id === a.arrivalEventId);
        if (!m?.scheduledTime) return null;
        return (m.scheduledTime - a.at) / 3600_000;
      })
      .filter((h): h is number => h !== null);
    const ackedTwoHoursPlus =
      ackLeads.length === 0
        ? 100
        : Math.round((ackLeads.filter((h) => h >= 2).length / ackLeads.length) * 100);

    const byMode = new Map<string, number>();
    const byCarrier = new Map<string, number>();
    for (const m of live) {
      byMode.set(m.mode, (byMode.get(m.mode) ?? 0) + 1);
      if (m.carrierName) byCarrier.set(m.carrierName, (byCarrier.get(m.carrierName) ?? 0) + 1);
    }

    const dutyConfirmed = duties.filter(
      (d) => d.status === "accepted" || d.status === "completed",
    ).length;

    return {
      kpis: {
        missedArrivals,
        ackedTwoHoursPlusPct: ackedTwoHoursPlus,
        escalations: live.filter((m) => m.status === "escalated").length,
        onPlatformPct: 100,
      },
      coordination: {
        totalMovements: live.length,
        acknowledged: live.filter((m) => m.status === "acknowledged").length,
        avgAckLeadHours:
          ackLeads.length === 0
            ? null
            : Math.round((ackLeads.reduce((s, h) => s + h, 0) / ackLeads.length) * 10) / 10,
        byMode: [...byMode.entries()].map(([mode, count]) => ({ mode, count })),
        byCarrier: [...byCarrier.entries()].map(([carrier, count]) => ({ carrier, count })),
      },
      duties: {
        total: duties.length,
        confirmed: dutyConfirmed,
        confirmationRatePct:
          duties.length === 0 ? 100 : Math.round((dutyConfirmed / duties.length) * 100),
      },
    };
  },
});
