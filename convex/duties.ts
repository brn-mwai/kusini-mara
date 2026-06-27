import { v } from "convex/values";
import {
  lodgeMutation,
  lodgeQuery,
  requireLodgeMovement,
  requireLodgeStaff,
} from "./lib/tenancy";
import { recordEvent } from "./lib/events";

export const list = lodgeQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_lodge", (q) => q.eq("lodgeId", ctx.org._id))
      .order("desc")
      .collect();
    return await Promise.all(
      rows.map(async (d) => {
        const staff = await ctx.db.get(d.staffId);
        const movement = await ctx.db.get(d.movementId);
        return {
          ...d,
          staffName: staff?.name ?? "—",
          staffRole: staff?.role ?? "",
          guestName: movement?.guestName ?? "—",
          airstrip: movement?.airstrip ?? "",
          direction: movement?.direction ?? "",
          scheduledTime: movement?.scheduledTime ?? 0,
        };
      }),
    );
  },
});

// Assign ground staff to a movement's pickup/dropoff. Upserts (one duty per
// movement) so re-assigning replaces the prior holder.
export const assign = lodgeMutation({
  args: {
    movementId: v.id("movements"),
    staffId: v.id("staff"),
    dutyType: v.optional(v.string()),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const m = await requireLodgeMovement(ctx, ctx.org, args.movementId);
    const staff = await requireLodgeStaff(ctx, ctx.org, args.staffId);
    const dutyType = args.dutyType ?? (m.direction === "arrival" ? "pickup" : "dropoff");

    const existing = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_movement", (q) => q.eq("movementId", m._id))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        staffId: staff._id,
        dutyType,
        status: "assigned",
        assignedAt: now,
      });
    } else {
      await ctx.db.insert("dutyAssignments", {
        movementId: m._id,
        lodgeId: m.lodgeId,
        staffId: staff._id,
        dutyType,
        status: "assigned",
        assignedAt: now,
      });
    }
    await recordEvent(ctx, {
      correlationId: m.correlationId,
      lodgeId: m.lodgeId,
      airlineId: m.airlineId,
      type: "duty_assigned",
      summary: `${staff.name} assigned to ${m.guestName} (${dutyType})`,
      movementId: m._id,
      byUserId: ctx.user._id,
    });
    return { ok: true };
  },
});
