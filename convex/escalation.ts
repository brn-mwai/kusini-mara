import { internalMutation } from "./_generated/server";
import { withId } from "./lib/base";
import { enqueueNotification } from "./lib/notify";

// Statuses that still owe an acknowledgment. A movement in one of these past its
// escalationDeadline is a silent gap — the exact failure Kusini exists to kill.
const AWAITING_ACK: readonly string[] = ["posted", "scheduled", "reconfirm_required"];

// Resolve the two escalation targets: the assigned side's backup + the poster.
// On an arrival the assigned side is the airstrip (its primary handler); the
// poster is the lodge duty/backup contact. Both get the Telegram alert.
async function escalationTargets(
  ctx: Parameters<typeof enqueueNotification>[0],
  event: { destinationPropertyId: string; airstripId?: string; assignedToSide: string },
) {
  const targets: {
    telegramChatId?: string;
    userId?: string;
    airstripContactId?: string;
    phone?: string;
  }[] = [];

  const property = await ctx.db
    .query("properties")
    .withIndex("by_portable_id", (q) => q.eq("id", event.destinationPropertyId))
    .first();

  if (property) {
    const backupId = property.backupContactUserId ?? property.dutyContactUserId;
    if (backupId) {
      const backup = await ctx.db
        .query("users")
        .withIndex("by_portable_id", (q) => q.eq("id", backupId))
        .first();
      if (backup) {
        targets.push({
          userId: backup.id,
          telegramChatId: backup.telegramChatId,
          phone: backup.phones.primaryPhoneNumber,
        });
      }
    }
  }

  if (event.airstripId) {
    const handler = await ctx.db
      .query("airstripContacts")
      .withIndex("by_airstrip", (q) => q.eq("airstripId", event.airstripId!))
      .first();
    if (handler) {
      targets.push({
        airstripContactId: handler.id,
        telegramChatId: handler.telegramChatId,
        phone: handler.phones.primaryPhoneNumber,
      });
    }
  }

  return targets;
}

// The scheduled scan (cron, every minute). Idempotent: only AWAITING_ACK rows
// flip to `escalated`, so re-running never double-escalates or re-notifies.
export const sweep = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const overdue = (
      await ctx.db.query("arrivalEvents").withIndex("by_status_deadline").collect()
    ).filter(
      (e) =>
        AWAITING_ACK.includes(e.status) &&
        e.escalationDeadline !== undefined &&
        e.escalationDeadline <= now,
    );

    let escalated = 0;
    for (const event of overdue) {
      await ctx.db.patch(event._id, { status: "escalated", updatedAt: now });
      await ctx.db.insert(
        "transferEvents",
        withId(
          {
            arrivalEventId: event.id,
            correlationId: event.correlationId,
            action: "escalated",
            fromStatus: event.status,
            toStatus: "escalated" as const,
            at: now,
            operatorId: event.operatorId,
            airlineId: event.airlineId,
          },
          now,
        ),
      );

      const guest = event.guestNames?.[0] ?? "party";
      const body = `ESCALATION: ${guest} (${event.partySize}) ${event.direction} is unacknowledged past its window. Confirm now.`;
      const targets = await escalationTargets(ctx, event);
      for (const recipient of targets) {
        await enqueueNotification(
          ctx,
          {
            recipient,
            templateKey: "escalation",
            body,
            arrivalEventId: event.id,
            correlationId: event.correlationId,
            operatorId: event.operatorId,
            airlineId: event.airlineId,
          },
          now,
        );
      }
      escalated++;
    }

    return { escalated };
  },
});
