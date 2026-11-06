import { type MutationCtx } from "../_generated/server";
import { withId } from "./base";

// The single notification boundary (ENTERPRISE-INTEGRATIONS: one enqueueNotification
// seam → outbox). A mutation NEVER calls a provider inline; it writes a durable
// `notifications` row + a `messageOutbox` row in the same transaction, and the
// scheduled drainer sends it with retry/backoff/dead-letter. A crash between the
// two is impossible — they commit together.

type Recipient = {
  telegramChatId?: string;
  phone?: string;
  userId?: string;
  airstripContactId?: string;
};

export type EnqueueArgs = {
  recipient: Recipient;
  templateKey: string; // arrival_nudge | reconfirm | escalation | ...
  body: string;
  arrivalEventId?: string;
  correlationId?: string;
  operatorId?: string;
  airlineId?: string;
};

export async function enqueueNotification(
  ctx: MutationCtx,
  args: EnqueueArgs,
  now: number = Date.now(),
): Promise<string | null> {
  if (!args.recipient.telegramChatId) {
    // No Telegram chat id captured (recipient hasn't started the bot). Record the
    // intent as a failed row for observability rather than silently dropping it.
    const skipped = withId(
      {
        recipientUserId: args.recipient.userId,
        recipientAirstripContactId: args.recipient.airstripContactId,
        recipientPhone: args.recipient.phone,
        channel: "telegram" as const,
        provider: "telegram_bot" as const,
        arrivalEventId: args.arrivalEventId,
        templateKey: args.templateKey,
        payload: { body: args.body },
        status: "failed" as const,
        errorCode: "no_telegram_chat_id",
        retryCount: 0,
        correlationId: args.correlationId,
        operatorId: args.operatorId,
        airlineId: args.airlineId,
      },
      now,
    );
    await ctx.db.insert("notifications", skipped);
    return null;
  }

  const notification = withId(
    {
      recipientUserId: args.recipient.userId,
      recipientAirstripContactId: args.recipient.airstripContactId,
      recipientPhone: args.recipient.phone,
      recipientTelegramChatId: args.recipient.telegramChatId,
      channel: "telegram" as const,
      provider: "telegram_bot" as const,
      arrivalEventId: args.arrivalEventId,
      templateKey: args.templateKey,
      payload: { body: args.body, chatId: args.recipient.telegramChatId },
      status: "queued" as const,
      retryCount: 0,
      correlationId: args.correlationId,
      operatorId: args.operatorId,
      airlineId: args.airlineId,
      queuedAt: now,
    },
    now,
  );
  await ctx.db.insert("notifications", notification);

  await ctx.db.insert(
    "messageOutbox",
    withId(
      {
        kind: "notification",
        refId: notification.id,
        payload: {
          chatId: args.recipient.telegramChatId,
          body: args.body,
          correlationId: args.correlationId,
        },
        status: "pending" as const,
        attempts: 0,
        nextAttemptAt: now,
      },
      now,
    ),
  );

  return notification.id;
}
