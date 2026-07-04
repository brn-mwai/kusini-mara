import { v } from "convex/values";

import { mutation } from "./_generated/server";
import {
  eventDirection,
  transportMode,
} from "./schema.master.foundation";
import { withStamps, withId } from "./lib/base";
import { getDemoLodge } from "./lib/tenancy";
import { ulid } from "./lib/ids";

// Lodge-side manual entry: posts a movement onto the board (dual-entry — the
// lodge is the creating party; a carrier can claim/enrich it later).
export const create = mutation({
  args: {
    guestName: v.string(),
    partySize: v.number(),
    direction: eventDirection,
    mode: transportMode,
    scheduledTime: v.number(),
    carrierName: v.optional(v.string()),
    specialNeeds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.partySize < 1) throw new Error("Party size must be at least 1.");
    if (args.guestName.trim() === "") throw new Error("Guest name is required.");

    const now = Date.now();
    const correlationId = ulid(now);

    const row = withStamps(
      {
        direction: args.direction,
        mode: args.mode,
        destinationPropertyId: property.id,
        carrierName: args.carrierName?.trim() || undefined,
        partySize: args.partySize,
        guestNames: [args.guestName.trim()],
        specialNeeds: args.specialNeeds?.trim() || undefined,
        scheduledTime: args.scheduledTime,
        guestReportOffsetMinutes: property.defaultReportOffsetMinutes,
        status: "posted" as const,
        correlationId,
        createdByOrgId: operator.id,
        operatorId: operator.id,
        reprotectCount: 0,
      },
      now,
    );
    await ctx.db.insert("arrivalEvents", row);

    await ctx.db.insert(
      "transferEvents",
      withId(
        {
          arrivalEventId: row.id,
          correlationId,
          action: "posted",
          toStatus: "posted" as const,
          at: now,
          operatorId: operator.id,
        },
        now,
      ),
    );

    return { id: row.id };
  },
});
