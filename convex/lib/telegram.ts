// Telegram Bot API send — the one place the provider is called. Behind this seam
// so a swap (or the AWS lift) touches one file. Throws on any non-ok so the outbox
// drainer records the failure and retries.
//
// Demo fallback: with no TELEGRAM_BOT_TOKEN set, return a mock delivery instead of
// throwing, so the acknowledgment/escalation loop closes end-to-end for a demo.
// This is an explicit, marked mock (messageId `mock-…`, mock:true recorded on the
// notification) — NOT a silent drop. Setting the token flips every send to the
// real Bot API with zero code change.

type SendResult = { messageId?: string; mock?: boolean };

export async function sendTelegram(chatId: string, text: string): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { messageId: `mock-${chatId}-${text.length}`, mock: true };
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`telegram ${res.status}: ${detail.slice(0, 200)}`);
  }
  const body = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string };
  if (!body.ok) throw new Error(`telegram not ok: ${body.description ?? "unknown"}`);
  return { messageId: body.result ? String(body.result.message_id) : undefined };
}
