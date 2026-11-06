import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Telegram update webhook. At-least-once → idempotent: the secret-token header is
// verified before any state change, and update_id is deduped so a redelivered
// update never double-processes. Unverified payloads are dropped (logged), never
// mutate state.
http.route({
  path: "/telegram/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
    const provided = req.headers.get("x-telegram-bot-api-secret-token");
    if (!expected || provided !== expected) {
      return new Response("unauthorized", { status: 401 });
    }

    let update: { update_id?: number; message?: { chat?: { id?: number }; text?: string } };
    try {
      update = await req.json();
    } catch {
      return new Response("bad request", { status: 400 });
    }
    if (typeof update.update_id !== "number") {
      return new Response("ignored", { status: 200 });
    }

    const accepted = await ctx.runMutation(internal.inbound.recordTelegramUpdate, {
      updateId: String(update.update_id),
      chatId: update.message?.chat?.id ? String(update.message.chat.id) : undefined,
      text: update.message?.text ?? "",
    });

    return new Response(accepted.duplicate ? "duplicate" : "ok", { status: 200 });
  }),
});

export default http;
