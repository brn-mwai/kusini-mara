import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { getDemoLodge } from "./lib/tenancy";
import { withId } from "./lib/base";

// One-tap acknowledgment — the product. Writes the ack record + the audit event
// and flips the movement's status. Tenant-guarded to the caller's property.
export const one = mutation({
  args: { arrivalEventId: v.string() },
  handler: async (ctx, { arrivalEventId }) => {
    const { property, operator } = await getDemoLodge(ctx);

    const event = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_portable_id", (q) => q.eq("id", arrivalEventId))
      .first();
    if (!event) throw new Error("Movement not found.");
    if (event.destinationPropertyId !== property.id) {
      throw new Error("Cross-tenant acknowledgment refused.");
    }

    // resolve the acting duty contact (demo: the property's duty contact or first user)
    let userId = property.dutyContactUserId;
    if (!userId) {
      const anyUser = await ctx.db
        .query("users")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .first();
      userId = anyUser?.id;
    }
    if (!userId) throw new Error("No duty contact to acknowledge as.");

    const now = Date.now();
    const isReconfirm = event.status === "reconfirm_required";

    await ctx.db.insert(
      "acknowledgments",
      withId({
        arrivalEventId: event.id,
        userId,
        type: isReconfirm ? "reconfirm" : "initial",
        channel: "push",
        at: now,
        propertyId: property.id,
        operatorId: operator.id,
      }),
    );

    await ctx.db.insert(
      "transferEvents",
      withId({
        arrivalEventId: event.id,
        correlationId: event.correlationId,
        actorUserId: userId,
        action: "acknowledged",
        fromStatus: event.status,
        toStatus: "acknowledged",
        at: now,
        operatorId: operator.id,
      }),
    );

    await ctx.db.patch(event._id, { status: "acknowledged", updatedAt: now });

    return { ok: true, status: "acknowledged" as const };
  },
});
