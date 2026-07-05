import { v } from "convex/values";

import { query } from "./_generated/server";
import { getDemoLodgeOrNull } from "./lib/tenancy";

// Sidebar global search (Twenty's search): matches movements, guests, staff and
// rooms by name; returns typed hits with the page to navigate to.
export const global = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant || q.trim().length < 2) return { hits: [] };
    const { property } = tenant;
    const needle = q.trim().toLowerCase();

    const [events, guests, staff, rooms] = await Promise.all([
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (qq) =>
          qq.eq("destinationPropertyId", property.id),
        )
        .collect(),
      ctx.db
        .query("guests")
        .withIndex("by_property", (qq) => qq.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("staff")
        .withIndex("by_property", (qq) => qq.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("rooms")
        .withIndex("by_property", (qq) => qq.eq("propertyId", property.id))
        .collect(),
    ]);

    const hits: { id: string; kind: string; label: string; sub: string; path: string }[] = [];

    for (const e of events) {
      const name = e.guestNames?.[0] ?? "";
      if (name.toLowerCase().includes(needle) || (e.carrierName ?? "").toLowerCase().includes(needle)) {
        hits.push({
          id: e.id,
          kind: "movement",
          label: `${name} ×${e.partySize}`,
          sub: `${e.direction} · ${e.status}`,
          path: "/board",
        });
      }
    }
    for (const g of guests) {
      const name = `${g.name.firstName} ${g.name.lastName}`;
      if (name.toLowerCase().includes(needle)) {
        hits.push({ id: g.id, kind: "guest", label: name.trim(), sub: g.guestType, path: "/guests" });
      }
    }
    for (const s of staff) {
      const name = `${s.name.firstName} ${s.name.lastName}`;
      if (name.toLowerCase().includes(needle)) {
        hits.push({ id: s.id, kind: "staff", label: name.trim(), sub: s.role, path: "/staff" });
      }
    }
    for (const r of rooms) {
      if (r.name.toLowerCase().includes(needle)) {
        hits.push({ id: r.id, kind: "room", label: r.name, sub: r.housekeepingStatus, path: "/rooms" });
      }
    }

    return { hits: hits.slice(0, 8) };
  },
});
