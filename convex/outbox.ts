import { v } from "convex/values";

import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { sendTelegram } from "./lib/telegram";

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 30_000;

function backoffWithJitter(attempts: number): number {
  const exp = BASE_BACKOFF_MS * Math.pow(2, attempts - 1);
  const jitter = Math.floor(Math.random() * BASE_BACKOFF_MS);
  return Math.min(exp + jitter, 15 * 60_000);
}

// Atomically claim due rows: flip pending → dispatching so a concurrent drain
// can't double-send. Returns the claimed rows' send payloads.
export const claimDue = internalMutation({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    const due = await ctx.db
      .query("messageOutbox")
      .withIndex("by_status_next_attempt", (q) =>
        q.eq("status", "pending").lte("nextAttemptAt", now),
      )
      .take(limit);

    const claimed = [];
    for (const row of due) {
      await ctx.db.patch(row._id, {
        status: "dispatching",
        attempts: row.attempts + 1,
      });
      claimed.push({
        id: row.id,
        refId: row.refId,
        attempts: row.attempts + 1,
        payload: row.payload as { chatId: string; body: string; correlationId?: string },
      });
    }
    return claimed;
  },
});

export const markSent = internalMutation({
  args: {
    outboxId: v.string(),
    notificationId: v.string(),
    providerMessageId: v.optional(v.string()),
    mock: v.optional(v.boolean()),
  },
  handler: async (ctx, { outboxId, notificationId, providerMessageId, mock }) => {
    const now = Date.now();
    const row = await ctx.db
      .query("messageOutbox")
      .withIndex("by_portable_id", (q) => q.eq("id", outboxId))
      .first();
    if (row) await ctx.db.patch(row._id, { status: "sent", dispatchedAt: now });

    const notif = await ctx.db
      .query("notifications")
      .withIndex("by_portable_id", (q) => q.eq("id", notificationId))
      .first();
    if (notif) {
      await ctx.db.patch(notif._id, {
        status: mock ? "delivered" : "sent",
        sentAt: now,
        deliveredAt: mock ? now : undefined,
        providerMessageId,
      });
    }
  },
});

// Failure path: retry with backoff until MAX_ATTEMPTS, then dead_letter (never
// silently lost — a dead_letter row + failed notification is the paging signal).
export const markFailed = internalMutation({
  args: { outboxId: v.string(), notificationId: v.string(), error: v.string() },
  handler: async (ctx, { outboxId, notificationId, error }) => {
    const now = Date.now();
    const row = await ctx.db
      .query("messageOutbox")
      .withIndex("by_portable_id", (q) => q.eq("id", outboxId))
      .first();
    if (!row) return;

    const exhausted = row.attempts >= MAX_ATTEMPTS;
    await ctx.db.patch(row._id, {
      status: exhausted ? "dead_letter" : "pending",
      lastError: error,
      nextAttemptAt: exhausted ? undefined : now + backoffWithJitter(row.attempts),
    });

    const notif = await ctx.db
      .query("notifications")
      .withIndex("by_portable_id", (q) => q.eq("id", notificationId))
      .first();
    if (notif) {
      await ctx.db.patch(notif._id, {
        status: exhausted ? "failed" : "queued",
        errorCode: error.slice(0, 200),
        retryCount: row.attempts,
      });
    }
  },
});

// The drainer — scheduled every minute. Claims due rows, sends via Telegram,
// reconciles. A crash after claim leaves rows in `dispatching`; the sweep-back
// requeues them (see requeueStuck) so nothing is stranded.
export const drain = internalAction({
  args: {},
  handler: async (ctx): Promise<{ drained: number }> => {
    const claimed = await ctx.runMutation(internal.outbox.claimDue, { limit: 25 });
    for (const item of claimed) {
      try {
        const result = await sendTelegram(item.payload.chatId, item.payload.body);
        await ctx.runMutation(internal.outbox.markSent, {
          outboxId: item.id,
          notificationId: item.refId,
          providerMessageId: result.messageId,
          mock: result.mock,
        });
      } catch (err) {
        await ctx.runMutation(internal.outbox.markFailed, {
          outboxId: item.id,
          notificationId: item.refId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { drained: claimed.length };
  },
});

// Recover rows a crashed drainer left mid-flight. A `dispatching` row older than
// the grace window is returned to `pending` so the next drain retries it.
export const requeueStuck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 5 * 60_000;
    const stuck = await ctx.db
      .query("messageOutbox")
      .withIndex("by_status_next_attempt", (q) => q.eq("status", "dispatching"))
      .collect();
    let requeued = 0;
    for (const row of stuck) {
      if ((row.nextAttemptAt ?? 0) < cutoff) {
        await ctx.db.patch(row._id, { status: "pending", nextAttemptAt: Date.now() });
        requeued++;
      }
    }
    return { requeued };
  },
});
