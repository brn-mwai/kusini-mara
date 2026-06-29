import { v } from "convex/values";
import {
  propertyMutation,
  propertyQuery,
  requirePropertyArrival,
  requirePropertyStaff,
  requirePropertyVehicle,
} from "./lib/tenancy";
import { recordEvent } from "./lib/events";
import { dutyType as dutyTypeV } from "./schema";

const DAY = 86400000;

export const list = propertyQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_property", (q) => q.eq("propertyId", ctx.property._id))
      .order("desc")
      .collect();
    return await Promise.all(
      rows.map(async (d) => {
        const staff = await ctx.db.get(d.staffId);
        const arrival = await ctx.db.get(d.arrivalId);
        const veh = d.vehicleId ? await ctx.db.get(d.vehicleId) : null;
        return {
          ...d,
          staffName: staff?.name ?? "—",
          staffRole: staff?.role ?? "",
          vehicleName: veh?.name ?? null,
          guestName: arrival?.guestName ?? "—",
          airstrip: arrival?.destinationLabel ?? "",
          direction: arrival?.direction ?? "",
          scheduledTime: arrival?.scheduledTime ?? 0,
        };
      }),
    );
  },
});

// Assign a staff member (and optionally a vehicle) to an arrival duty. Multiple
// duties per arrival are allowed — a charter needing two vehicles gets two
// assignments. Availability is enforced: a staff member on approved leave that
// day is rejected.
export const assign = propertyMutation({
  args: {
    arrivalId: v.id("arrivalEvents"),
    staffId: v.id("staff"),
    vehicleId: v.optional(v.id("vehicles")),
    dutyType: v.optional(dutyTypeV),
    seatsCovered: v.optional(v.number()),
  },
  returns: v.object({ dutyId: v.id("dutyAssignments") }),
  handler: async (ctx, args) => {
    const arrival = await requirePropertyArrival(ctx, ctx.property, args.arrivalId);
    const staff = await requirePropertyStaff(ctx, ctx.property, args.staffId);
    if (args.vehicleId) await requirePropertyVehicle(ctx, ctx.property, args.vehicleId);

    // Availability: reject if the staff member is on leave on the arrival day.
    const dayStart = Math.floor(arrival.scheduledTime / DAY) * DAY;
    const onLeave = await ctx.db
      .query("leaveDays")
      .withIndex("by_staff_date", (q) =>
        q.eq("staffId", staff._id).eq("date", dayStart),
      )
      .unique();
    if (onLeave) throw new Error(`${staff.name} is on leave that day`);

    const dutyType = args.dutyType ?? (arrival.direction === "arrival" ? "airstrip_pickup" : "airstrip_dropoff");
    const dutyId = await ctx.db.insert("dutyAssignments", {
      arrivalId: arrival._id,
      propertyId: arrival.propertyId,
      staffId: staff._id,
      vehicleId: args.vehicleId,
      dutyType,
      status: "assigned",
      seatsCovered: args.seatsCovered,
      assignedAt: Date.now(),
    });
    await recordEvent(ctx, {
      correlationId: arrival.correlationId,
      propertyId: arrival.propertyId,
      airlineId: arrival.airlineId,
      type: "duty_assigned",
      summary: `${staff.name} assigned to ${arrival.guestName} (${dutyType})`,
      arrivalId: arrival._id,
      byUserId: ctx.user._id,
    });
    return { dutyId };
  },
});

export const remove = propertyMutation({
  args: { dutyId: v.id("dutyAssignments") },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const duty = await ctx.db.get(args.dutyId);
    if (!duty || duty.propertyId !== ctx.property._id) throw new Error("Duty not found");
    await ctx.db.delete(duty._id);
    return { ok: true };
  },
});
