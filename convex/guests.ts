import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  guestType,
  requirementCategory,
  requirementSeverity,
} from "./schema.master.ops";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps, withId } from "./lib/base";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [guests, requirements, bookings] = await Promise.all([
      ctx.db
        .query("guests")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("guestRequirements")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("bookings")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const rows = guests
      .filter((g) => g.archivedAt === undefined && g.erasedAt === undefined)
      .map((g) => {
        const reqs = requirements.filter((r) => r.guestId === g.id);
        const booking = bookings.find((b) => b.id === g.bookingId);
        return {
          id: g.id,
          name: `${g.name.firstName} ${g.name.lastName}`.trim(),
          guestType: g.guestType,
          age: g.age ?? null,
          isLead: g.isLead,
          bookingRef: booking?.guestName ?? null,
          requirements: reqs.map((r) => ({
            id: r.id,
            category: r.category,
            label: r.label,
            severity: r.severity,
          })),
          critical: reqs.some((r) => r.severity === "critical"),
        };
      })
      .sort((a, b) => Number(b.isLead) - Number(a.isLead));

    const bookingOptions = bookings
      .filter((b) => b.archivedAt === undefined)
      .map((b) => ({ id: b.id, label: `${b.guestName} (${b.arrivalDate})` }));

    return { rows, bookingOptions };
  },
});

export const create = mutation({
  args: {
    bookingId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    guestType,
    age: v.optional(v.number()),
    isLead: v.boolean(),
    requirement: v.optional(
      v.object({
        category: requirementCategory,
        label: v.string(),
        severity: requirementSeverity,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { property } = await getDemoLodge(ctx);
    if (args.firstName.trim() === "" && args.lastName.trim() === "") {
      throw new Error("Guest name is required.");
    }

    const now = Date.now();
    const guest = withStamps(
      {
        bookingId: args.bookingId,
        propertyId: property.id,
        name: {
          firstName: args.firstName.trim(),
          lastName: args.lastName.trim(),
        },
        guestType: args.guestType,
        age: args.age,
        isLead: args.isLead,
      },
      now,
    );
    await ctx.db.insert("guests", guest);

    if (args.requirement && args.requirement.label.trim() !== "") {
      await ctx.db.insert(
        "guestRequirements",
        withId(
          {
            guestId: guest.id,
            propertyId: property.id,
            category: args.requirement.category,
            label: args.requirement.label.trim(),
            severity: args.requirement.severity,
            carriesForward: false,
          },
          now,
        ),
      );
    }

    return { id: guest.id };
  },
});
