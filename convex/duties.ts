import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps, withId } from "./lib/base";

// Duty board: today's ground jobs. One duty per movement (pickup for arrivals,
// dropoff for departures) with staff + vehicle assignment and capacity checks.
export const board = query({
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

    const dutyByEvent = new Map(duties.map((d) => [d.arrivalEventId, d]));

    const rows = events
      .filter(
        (e) =>
          e.archivedAt === undefined &&
          e.status !== "cancelled" &&
          e.status !== "completed",
      )
      .map((e) => {
        const duty = dutyByEvent.get(e.id);
        const assignedStaff = duty?.staffId
          ? staff.find((s) => s.id === duty.staffId)
          : undefined;
        const assignedVehicle = duty?.vehicleId
          ? vehicles.find((vh) => vh.id === duty.vehicleId)
          : undefined;
        return {
          eventId: e.id,
          guest: e.guestNames?.[0] ?? "Guest",
          partySize: e.partySize,
          direction: e.direction,
          scheduledTime: e.scheduledTime ?? null,
          dutyType:
            e.direction === "arrival" ? "airstrip_pickup" : "airstrip_dropoff",
          dutyId: duty?.id ?? null,
          dutyStatus: duty?.status ?? "unassigned",
          staffId: assignedStaff?.id ?? null,
          staffName: assignedStaff
            ? `${assignedStaff.name.firstName} ${assignedStaff.name.lastName}`
            : null,
          vehicleId: assignedVehicle?.id ?? null,
          vehicleName: assignedVehicle?.name ?? null,
          vehicleSeats: assignedVehicle?.seatCapacity ?? null,
          seatShortfall:
            assignedVehicle !== undefined &&
            assignedVehicle.seatCapacity < e.partySize
              ? e.partySize - assignedVehicle.seatCapacity
              : 0,
        };
      })
      .sort(
        (a, b) => (a.scheduledTime ?? Infinity) - (b.scheduledTime ?? Infinity),
      );

    return {
      property: { id: property.id, name: property.name },
      rows,
      staff: staff
        .filter((s) => s.active)
        .map((s) => ({
          id: s.id,
          name: `${s.name.firstName} ${s.name.lastName}`,
          role: s.role,
        })),
      vehicles: vehicles
        .filter((vh) => vh.status === "active")
        .map((vh) => ({ id: vh.id, name: vh.name, seats: vh.seatCapacity })),
    };
  },
});

export const assign = mutation({
  args: {
    arrivalEventId: v.string(),
    staffId: v.optional(v.string()),
    vehicleId: v.optional(v.string()),
  },
  handler: async (ctx, { arrivalEventId, staffId, vehicleId }) => {
    const { property, operator } = await getDemoLodge(ctx);

    const event = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_portable_id", (q) => q.eq("id", arrivalEventId))
      .first();
    if (!event) throw new Error("Movement not found.");
    if (event.destinationPropertyId !== property.id) {
      throw new Error("Cross-tenant assignment refused.");
    }

    if (vehicleId) {
      const vehicle = await ctx.db
        .query("vehicles")
        .withIndex("by_portable_id", (q) => q.eq("id", vehicleId))
        .first();
      if (!vehicle) throw new Error("Vehicle not found.");
      if (vehicle.seatCapacity < event.partySize) {
        throw new Error(
          `${vehicle.name} seats ${vehicle.seatCapacity} — party of ${event.partySize} needs a bigger vehicle or a second one.`,
        );
      }
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_event", (q) => q.eq("arrivalEventId", event.id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        staffId: staffId ?? existing.staffId,
        vehicleId: vehicleId ?? existing.vehicleId,
        status: "assigned",
        updatedAt: now,
      });
    } else {
      await ctx.db.insert(
        "dutyAssignments",
        withStamps(
          {
            arrivalEventId: event.id,
            propertyId: property.id,
            dutyType:
              event.direction === "arrival"
                ? ("airstrip_pickup" as const)
                : ("airstrip_dropoff" as const),
            staffId,
            vehicleId,
            status: "assigned" as const,
          },
          now,
        ),
      );
    }

    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: event.id,
          correlationId: event.correlationId,
          action: "duty_assigned",
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );

    return { ok: true };
  },
});

export const clear = mutation({
  args: { arrivalEventId: v.string() },
  handler: async (ctx, { arrivalEventId }) => {
    const { property } = await getDemoLodge(ctx);
    const existing = await ctx.db
      .query("dutyAssignments")
      .withIndex("by_event", (q) => q.eq("arrivalEventId", arrivalEventId))
      .first();
    if (existing && existing.propertyId === property.id) {
      await ctx.db.delete(existing._id);
    }
    return { ok: true };
  },
});
