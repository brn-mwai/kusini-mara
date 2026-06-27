import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { recordEvent } from "./lib/events";
import type { Id } from "./_generated/dataModel";

// Create an outbox notification row transactionally, then schedule its network
// delivery. Keeping the row inline (not behind another scheduled mutation) means
// the escalation and its audit trail commit together.
async function queueNotification(
  ctx: MutationCtx,
  args: {
    toPhone: string;
    toUserId?: Id<"users">;
    movementId: Id<"movements">;
    lodgeId: Id<"organizations">;
    airlineId: Id<"organizations">;
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
    movementId: args.movementId,
    lodgeId: args.lodgeId,
    airlineId: args.airlineId,
    kind: "escalation",
    body: args.body,
    delivered: false,
    attempts: 0,
    correlationId: args.correlationId,
  });
  await ctx.scheduler.runAfter(0, internal.notifications.deliver, { id });
}

// Scheduler sweep. Any movement that is `scheduled` (flight assigned, not yet
// acknowledged) and has crossed its escalation deadline is escalated: status →
// escalated, an event is written, and SMS goes to the lodge backup contact + the
// airline ops line. Both boards reflect it live off the status change.
//
// Predicate: status == "scheduled" AND escalationDeadline <= now. Runs every
// minute via crons; idempotent (already-escalated rows leave the `scheduled`
// bucket so they are not re-fired).
export const sweep = internalMutation({
  args: {},
  returns: v.object({ escalated: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("movements")
      .withIndex("by_status_deadline", (q) =>
        q.eq("status", "scheduled").lte("escalationDeadline", now),
      )
      .collect();

    let escalated = 0;
    for (const m of due) {
      await ctx.db.patch(m._id, { status: "escalated", escalatedAt: now });
      await recordEvent(ctx, {
        correlationId: m.correlationId,
        lodgeId: m.lodgeId,
        airlineId: m.airlineId,
        type: "escalation_fired",
        summary: `Unacknowledged within window — escalated for ${m.guestName} (${m.direction}) at ${m.airstrip}`,
        movementId: m._id,
      });

      const lodge = await ctx.db.get(m.lodgeId);
      const airline = await ctx.db.get(m.airlineId);
      const body = `KUSINI ESCALATION: ${m.guestName} (${m.pax} pax) ${m.direction} at ${m.airstrip} is unacknowledged and inside the transfer window. Please confirm pickup now.`;

      // Lodge backup contact.
      const backupId = lodge?.backupContactId;
      const backup = backupId ? await ctx.db.get(backupId) : null;
      if (backup?.phone) {
        await queueNotification(ctx, {
          toPhone: backup.phone,
          toUserId: backup._id,
          movementId: m._id,
          lodgeId: m.lodgeId,
          airlineId: m.airlineId,
          body,
          correlationId: m.correlationId,
        });
      }
      // Airline ops line.
      const opsPhone = airline?.opsPhone ?? process.env.ESCALATION_AIRLINE_OPS_PHONE;
      if (opsPhone) {
        await queueNotification(ctx, {
          toPhone: opsPhone,
          movementId: m._id,
          lodgeId: m.lodgeId,
          airlineId: m.airlineId,
          body,
          correlationId: m.correlationId,
        });
      }
      escalated++;
    }
    return { escalated };
  },
});
