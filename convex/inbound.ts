import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { withId } from "./lib/base";

// Idempotent inbound handler. Dedupes on (telegram, update_id): a redelivered
// update returns { duplicate: true } and mutates nothing. First delivery records
// the raw message for the shorthand parser + audit.
export const recordTelegramUpdate = internalMutation({
  args: { updateId: v.string(), chatId: v.optional(v.string()), text: v.string() },
  handler: async (ctx, { updateId, chatId, text }) => {
    const now = Date.now();
    const seen = await ctx.db
      .query("webhookDedupe")
      .withIndex("by_provider_key", (q) =>
        q.eq("provider", "telegram").eq("dedupeKey", updateId),
      )
      .first();
    if (seen) return { duplicate: true };

    await ctx.db.insert(
      "webhookDedupe",
      withId({ provider: "telegram", dedupeKey: updateId, at: now }, now),
    );

    await ctx.db.insert(
      "inboundMessages",
      withId(
        {
          channel: "telegram" as const,
          provider: "telegram_bot" as const,
          fromAddress: chatId ?? "unknown",
          raw: text,
          status: "received",
          at: now,
        },
        now,
      ),
    );

    return { duplicate: false };
  },
});
