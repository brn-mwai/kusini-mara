import { v } from "convex/values";

import { query } from "./_generated/server";
import { getDemoLodgeOrNull } from "./lib/tenancy";

// The Lodge calendar: stays + leave + duties projected onto one surface
// (Twenty calendarEvent shape, computed on read — no table writes needed yet).
export const month = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, { year, month }) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const pad = (n: number) => String(n).padStart(2, "0");
    const monthPrefix = `${year}-${pad(month)}`;

    const [stays, bookings, plan, staff, events] = await Promise.all([
      ctx.db
        .query("stays")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("bookings")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("leavePlan")
        .withIndex("by_property_and_date", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("staff")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (q) =>
          q.eq("destinationPropertyId", property.id),
        )
        .collect(),
    ]);

    const calendarEvents: {
      id: string;
      kind: "stay" | "leave" | "duty";
      title: string;
      startDate: string;
      endDate: string;
    }[] = [];

    for (const s of stays) {
      if (s.archivedAt !== undefined || s.status === "cancelled") continue;
      const booking = bookings.find((b) => b.id === s.bookingId);
      if (
        s.plannedCheckIn.startsWith(monthPrefix) ||
        s.plannedCheckOut.startsWith(monthPrefix) ||
        (s.plannedCheckIn < `${monthPrefix}-01` && s.plannedCheckOut > `${monthPrefix}-31`)
      ) {
        calendarEvents.push({
          id: `stay-${s.id}`,
          kind: "stay",
          title: booking?.guestName ?? "Stay",
          startDate: s.plannedCheckIn,
          endDate: s.plannedCheckOut,
        });
      }
    }

    for (const p of plan) {
      if (p.status === "cancelled" || !p.date.startsWith(monthPrefix)) continue;
      const s = staff.find((st) => st.id === p.staffId);
      calendarEvents.push({
        id: `leave-${p.id}`,
        kind: "leave",
        title: s ? `${s.name.firstName} ${s.name.lastName} · leave` : "Leave",
        startDate: p.date,
        endDate: p.date,
      });
    }

    for (const e of events) {
      if (e.archivedAt !== undefined || e.status === "cancelled" || !e.scheduledTime) continue;
      const date = new Date(e.scheduledTime).toISOString().slice(0, 10);
      if (!date.startsWith(monthPrefix)) continue;
      calendarEvents.push({
        id: `duty-${e.id}`,
        kind: "duty",
        title: `${e.guestNames?.[0] ?? "Guest"} ${e.direction === "arrival" ? "↓" : "↑"}`,
        startDate: date,
        endDate: date,
      });
    }

    return { events: calendarEvents };
  },
});
