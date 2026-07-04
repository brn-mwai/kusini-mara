import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { recordEvent } from "./lib/events";
import type { Id } from "./_generated/dataModel";

async function queueNotification(
  ctx: MutationCtx,
  args: {
    toPhone: string;
    toUserId?: Id<"users">;
    arrivalId: Id<"arrivalEvents">;
    propertyId: Id<"properties">;
    airlineId?: Id<"airlines">;
    body: string;
    correlationId: string;
  },
): Promise<void> {
  const id = await ctx.db.insert("notifications", {
    at: Date.now(),
    channel: "sms",
    status: "pending",
    toPhone: args.toPhone,
    toUserId: args.toUserId,
    arrivalId: args.arrivalId,
    propertyId: args.propertyId,
    airlineId: args.airlineId,
    kind: "escalation",
    body: args.body,
    delivered: false,
    attempts: 0,
    correlationId: args.correlationId,
  });
  await ctx.scheduler.runAfter(0, internal.notifications.deliver, { id });
}

// Sweep: any arrival that is `scheduled` (firm, not yet acknowledged) and past
// its escalation deadline is escalated, with SMS to the property backup contact
// and the airline ops desk. Runs every minute via crons; idempotent.
export const sweep = internalMutation({
  args: {},
  returns: v.object({ escalated: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("arrivalEvents")
      .withIndex("by_status_deadline", (q) =>
        q.eq("status", "scheduled").lte("escalationDeadline", now),
      )
      .collect();

    let escalated = 0;
    for (const a of due) {
      await ctx.db.patch(a._id, { status: "escalated", escalatedAt: now });
      await recordEvent(ctx, {
        correlationId: a.correlationId,
        propertyId: a.propertyId,
        airlineId: a.airlineId,
        type: "escalation_fired",
        summary: `Unacknowledged within window — escalated for ${a.guestName} (${a.mode} ${a.direction}) to ${a.destinationLabel}`,
        arrivalId: a._id,
      });

      const property = await ctx.db.get(a.propertyId);
      const airline = a.airlineId ? await ctx.db.get(a.airlineId) : null;
      const body = `KUSINI ESCALATION: ${a.guestName} (${a.pax} pax) ${a.direction} via ${a.mode} to ${a.destinationLabel} is unacknowledged and inside the transfer window. Please confirm now.`;

      const backupId = property?.backupContactId;
      const backup = backupId ? await ctx.db.get(backupId) : null;
      if (backup?.phoneE164) {
        await queueNotification(ctx, {
          toPhone: backup.phoneE164,
          toUserId: backup._id,
          arrivalId: a._id,
          propertyId: a.propertyId,
          airlineId: a.airlineId,
          body,
          correlationId: a.correlationId,
        });
      }
      const opsPhone = airline?.opsPhone ?? property?.opsPhone ?? process.env.ESCALATION_AIRLINE_OPS_PHONE;
      if (opsPhone) {
        await queueNotification(ctx, {
          toPhone: opsPhone,
          arrivalId: a._id,
          propertyId: a.propertyId,
          airlineId: a.airlineId,
          body,
          correlationId: a.correlationId,
        });
      }
      escalated++;
    }
    return { escalated };
  },
});
