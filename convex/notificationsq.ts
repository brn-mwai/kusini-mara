import { query } from "./_generated/server";
import { getDemoLodgeOrNull } from "./lib/tenancy";

// Activity + delivery feed: transferEvents (the audit spine) merged with
// notifications (channel deliveries), newest first.
export const feed = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property, operator } = tenant;

    const [events, notifications, movements] = await Promise.all([
      ctx.db
        .query("transferEvents")
        .withIndex("by_at")
        .order("desc")
        .take(100),
      ctx.db.query("notifications").order("desc").take(100),
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (q) =>
          q.eq("destinationPropertyId", property.id),
        )
        .collect(),
    ]);

    const guestOf = (arrivalEventId: string | undefined) =>
      movements.find((m) => m.id === arrivalEventId)?.guestNames?.[0] ?? null;

    const items = [
      ...events
        .filter((e) => e.operatorId === operator.id || e.operatorId === undefined)
        .map((e) => ({
          id: `evt-${e.id}`,
          kind:
            e.action === "escalation_fired" || e.toStatus === "escalated"
              ? ("escalation" as const)
              : e.action === "acknowledged"
                ? ("acknowledgment" as const)
                : ("activity" as const),
          label: e.action.replace(/_/g, " "),
          guest: guestOf(e.arrivalEventId),
          channel: null as string | null,
          status: e.toStatus ?? null,
          at: e.at,
        })),
      ...notifications
        .filter((n) => n.operatorId === operator.id || n.operatorId === undefined)
        .map((n) => ({
          id: `not-${n.id}`,
          kind: "delivery" as const,
          label: n.templateKey.replace(/_/g, " "),
          guest: guestOf(n.arrivalEventId ?? undefined),
          channel: n.channel as string | null,
          status: n.status as string | null,
          at: n.queuedAt ?? 0,
        })),
    ].sort((a, b) => b.at - a.at);

    return { items: items.slice(0, 100) };
  },
});
