// ─────────────────────────────────────────────────────────────────────────────
// Notifications port. SMS via Africa's Talking is the guaranteed channel and the
// escalation backbone; WhatsApp (Twilio) is a preference channel. Both sit behind
// one interface so the pilot can run SMS-only and mock the rest when creds are
// absent. A provider with no creds returns a `mock` result — the caller still
// records the notification, it just isn't delivered over the wire.
// ─────────────────────────────────────────────────────────────────────────────

export type SendResult = {
  channel: "sms" | "whatsapp" | "mock";
  delivered: boolean;
  error?: string;
};

// Africa's Talking SMS.
export async function sendSms(to: string, body: string): Promise<SendResult> {
  const username = process.env.AFRICASTALKING_USERNAME;
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  if (!username || !apiKey) {
    return { channel: "mock", delivered: false };
  }
  try {
    const params = new URLSearchParams({ username, to, message: body });
    const sender = process.env.AFRICASTALKING_SENDER_ID;
    if (sender) params.set("from", sender);
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      return { channel: "sms", delivered: false, error: `AT ${res.status}` };
    }
    return { channel: "sms", delivered: true };
  } catch (e) {
    return { channel: "sms", delivered: false, error: String(e) };
  }
}

// Twilio WhatsApp (preference channel).
export async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    return { channel: "mock", delivered: false };
  }
  try {
    const params = new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${from}`,
      Body: body,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    if (!res.ok) {
      return { channel: "whatsapp", delivered: false, error: `Twilio ${res.status}` };
    }
    return { channel: "whatsapp", delivered: true };
  } catch (e) {
    return { channel: "whatsapp", delivered: false, error: String(e) };
  }
}
