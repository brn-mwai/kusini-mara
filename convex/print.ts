import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { printType } from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withId } from "./lib/base";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const jobs = await ctx.db
      .query("printJobs")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .collect();

    return {
      rows: jobs
        .map((j) => ({
          id: j.id,
          type: j.type,
          rangeStart: j.rangeStart,
          rangeEnd: j.rangeEnd,
          versionStamp: j.versionStamp,
          generatedAt: j.generatedAt,
          superseded: j.supersededAt !== undefined,
        }))
        .sort((a, b) => b.generatedAt - a.generatedAt),
    };
  },
});

// Generates the sheet's data snapshot (client renders + window.print) and records
// the versioned job; any earlier job covering the same range is superseded.
export const generate = mutation({
  args: { type: printType, date: v.string() },
  handler: async (ctx, { type, date }) => {
    const { property } = await getDemoLodge(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("printJobs")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .collect();
    for (const job of existing) {
      if (job.type === type && job.rangeStart === date && job.supersededAt === undefined) {
        await ctx.db.patch(job._id, { supersededAt: now });
      }
    }

    const stamp = new Date(now);
    const versionStamp = `Generated ${stamp.getDate()}/${stamp.getMonth() + 1} ${String(stamp.getHours()).padStart(2, "0")}:${String(stamp.getMinutes()).padStart(2, "0")} — supersedes earlier`;

    const row = withId(
      {
        propertyId: property.id,
        type,
        rangeStart: date,
        rangeEnd: date,
        versionStamp,
        fileId: "client-print",
        generatedAt: now,
      },
      now,
    );
    await ctx.db.insert("printJobs", row);
    return { id: row.id, versionStamp };
  },
});

// The data a daily run-sheet renders: duties joined with movements + staff + vehicles.
export const runSheet = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [events, duties, staff, vehicles] = await Promise.all([
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_property_and_date", (q) =>
          q.eq("destinationPropertyId", property.id),
        )
        .collect(),
      ctx.db
        .query("dutyAssignments")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("staff")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("vehicles")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const lines = events
      .filter((e) => e.archivedAt === undefined && e.status !== "cancelled")
      .map((e) => {
        const duty = duties.find((d) => d.arrivalEventId === e.id);
        const s = duty?.staffId ? staff.find((st) => st.id === duty.staffId) : undefined;
        const vh = duty?.vehicleId ? vehicles.find((x) => x.id === duty.vehicleId) : undefined;
        return {
          guest: e.guestNames?.[0] ?? "Guest",
          pax: e.partySize,
          direction: e.direction,
          time: e.scheduledTime ?? null,
          carrier: e.carrierName ?? null,
          staff: s ? `${s.name.firstName} ${s.name.lastName}` : null,
          vehicle: vh?.name ?? null,
        };
      })
      .sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity));

    return { property: property.name, lines };
  },
});
