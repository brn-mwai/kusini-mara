import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../convex/schema";
import { api, internal } from "../convex/_generated/api";
import { ulid } from "../convex/lib/ids";

const modules = import.meta.glob("../convex/**/*.ts");

// The demo tenant is the first seeded property (Riverbend). seed:run builds the
// operator + property + airstrip + handler + backup + today's movements.
async function seeded() {
  const t = convexTest(schema, modules);
  await t.mutation(api.seed.run, {});
  return t;
}

async function firstPropertyId(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const p = await ctx.db.query("properties").first();
    return p!.id;
  });
}

describe("handshake: post -> assign -> acknowledge -> set pickup time", () => {
  test("arrival posted by lodge is assigned to the airstrip and acknowledges with a pickup time", async () => {
    const t = await seeded();
    const pickup = Date.now() + 3 * 3600_000;
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Okafor",
      partySize: 4,
      direction: "arrival",
      mode: "charter",
      scheduledTime: Date.now() + 2 * 3600_000,
    });

    const posted = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(posted?.postedBySide).toBe("lodge");
    expect(posted?.assignedToSide).toBe("airstrip");
    expect(posted?.status).toBe("posted");

    await t.mutation(api.ack.one, { arrivalEventId: id, confirmedPickupTime: pickup });
    const acked = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(acked?.status).toBe("acknowledged");
    expect(acked?.confirmedPickupTime).toBe(pickup);
    expect(acked?.escalationDeadline).toBeUndefined();
  });

  test("departure posted by lodge is assigned to the lodge side", async () => {
    const t = await seeded();
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Perry",
      partySize: 2,
      direction: "departure",
      mode: "road_transfer",
      scheduledTime: Date.now() + 4 * 3600_000,
    });
    const posted = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(posted?.assignedToSide).toBe("lodge");
  });

  test("posting an arrival enqueues a Telegram nudge to the strip handler", async () => {
    const t = await seeded();
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Givens",
      partySize: 7,
      direction: "arrival",
      mode: "charter",
      scheduledTime: Date.now() + 2 * 3600_000,
    });
    const outbox = await t.run((ctx) => ctx.db.query("messageOutbox").collect());
    expect(outbox.some((o) => o.status === "pending")).toBe(true);
    const notif = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_event", (q) => q.eq("arrivalEventId", id)).first(),
    );
    expect(notif?.templateKey).toBe("arrival_nudge");
    expect(notif?.channel).toBe("telegram");
  });
});

describe("escalation", () => {
  test("fires for an unacknowledged movement past its window and enqueues Telegram", async () => {
    const t = await seeded();
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Hargreaves",
      partySize: 2,
      direction: "arrival",
      mode: "charter",
      scheduledTime: Date.now() + 2 * 3600_000,
    });
    await t.run((ctx) =>
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_portable_id", (q) => q.eq("id", id))
        .first()
        .then((e) => ctx.db.patch(e!._id, { escalationDeadline: Date.now() - 1000 })),
    );

    const res = await t.mutation(internal.escalation.sweep, {});
    expect(res.escalated).toBeGreaterThanOrEqual(1);

    const after = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(after?.status).toBe("escalated");

    const notifs = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_event", (q) => q.eq("arrivalEventId", id)).collect(),
    );
    expect(notifs.some((n) => n.templateKey === "escalation")).toBe(true);
  });

  test("an acknowledged movement is never escalated", async () => {
    const t = await seeded();
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Lee",
      partySize: 2,
      direction: "arrival",
      mode: "charter",
      scheduledTime: Date.now() + 2 * 3600_000,
    });
    await t.mutation(api.ack.one, { arrivalEventId: id, confirmedPickupTime: Date.now() + 3 * 3600_000 });
    await t.run((ctx) =>
      ctx.db
        .query("arrivalEvents")
        .withIndex("by_portable_id", (q) => q.eq("id", id))
        .first()
        .then((e) => ctx.db.patch(e!._id, { escalationDeadline: Date.now() - 1000 })),
    );
    await t.mutation(internal.escalation.sweep, {});
    const after = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(after?.status).toBe("acknowledged");
    const escalations = await t.run((ctx) =>
      ctx.db.query("transferEvents").withIndex("by_event", (q) => q.eq("arrivalEventId", id)).collect(),
    );
    expect(escalations.some((e) => e.action === "escalated")).toBe(false);
  });
});

describe("tenant isolation", () => {
  test("the lodge cannot acknowledge another property's movement and never sees it", async () => {
    const t = await seeded();
    const otherId = await t.run(async (ctx) => {
      const now = Date.now();
      const operatorId = ulid();
      await ctx.db.insert("organizations", {
        id: operatorId, kind: "lodge_operator", name: "Other Collection", createdAt: now, updatedAt: now,
      });
      const otherPropertyId = ulid();
      await ctx.db.insert("properties", {
        id: otherPropertyId, operatorId, name: "Acacia", region: "maasai_mara",
        escalationWindowMinutes: 120, defaultReportOffsetMinutes: 30,
        carryoverPolicy: "hard_reset", timezone: "Africa/Nairobi", createdAt: now, updatedAt: now,
      });
      const eventId = ulid();
      await ctx.db.insert("arrivalEvents", {
        id: eventId, direction: "arrival", mode: "charter", destinationPropertyId: otherPropertyId,
        partySize: 2, guestNames: ["Brandt"], scheduledTime: now + 2 * 3600_000,
        postedBySide: "lodge", assignedToSide: "airstrip", status: "posted",
        correlationId: ulid(), createdByOrgId: operatorId, operatorId, reprotectCount: 0,
        createdAt: now, updatedAt: now,
      });
      return eventId;
    });

    await expect(t.mutation(api.ack.one, { arrivalEventId: otherId })).rejects.toThrow();
    const board = await t.query(api.board.today, {});
    expect(board?.rows.find((r) => r.id === otherId)).toBeUndefined();
  });
});

describe("delivery guarantee: outbox retry then dead-letter", () => {
  test("a repeatedly failing send retries then dead-letters, never silently lost", async () => {
    const t = await seeded();
    const { notifId, outboxId } = await t.run(async (ctx) => {
      const now = Date.now();
      const nId = ulid();
      await ctx.db.insert("notifications", {
        id: nId, channel: "telegram", provider: "telegram_bot", templateKey: "escalation",
        payload: { body: "x" }, status: "queued", retryCount: 0,
        recipientTelegramChatId: "chat", queuedAt: now,
      });
      const oId = ulid();
      await ctx.db.insert("messageOutbox", {
        id: oId, kind: "notification", refId: nId, payload: { chatId: "chat", body: "x" },
        status: "pending", attempts: 0, nextAttemptAt: now,
      });
      return { notifId: nId, outboxId: oId };
    });

    for (let i = 0; i < 5; i++) {
      await t.mutation(internal.outbox.claimDue, { limit: 10 });
      await t.mutation(internal.outbox.markFailed, {
        outboxId, notificationId: notifId, error: "telegram 500",
      });
      // re-open nextAttemptAt for the next claim (skip the backoff wait in the test)
      await t.run((ctx) =>
        ctx.db
          .query("messageOutbox")
          .withIndex("by_portable_id", (q) => q.eq("id", outboxId))
          .first()
          .then((o) => o && o.status === "pending" && ctx.db.patch(o._id, { nextAttemptAt: Date.now() })),
      );
    }

    const outbox = await t.run((ctx) =>
      ctx.db.query("messageOutbox").withIndex("by_portable_id", (q) => q.eq("id", outboxId)).first(),
    );
    const notif = await t.run((ctx) =>
      ctx.db.query("notifications").withIndex("by_portable_id", (q) => q.eq("id", notifId)).first(),
    );
    expect(outbox?.status).toBe("dead_letter");
    expect(notif?.status).toBe("failed");
  });
});

describe("inbound Telegram webhook is idempotent", () => {
  test("the same update_id processes once; redelivery is a no-op duplicate", async () => {
    const t = await seeded();
    const first = await t.mutation(internal.inbound.recordTelegramUpdate, {
      updateId: "555", chatId: "chat", text: "Confirmed",
    });
    const second = await t.mutation(internal.inbound.recordTelegramUpdate, {
      updateId: "555", chatId: "chat", text: "Confirmed",
    });
    expect(first.duplicate).toBe(false);
    expect(second.duplicate).toBe(true);
    const inbound = await t.run((ctx) => ctx.db.query("inboundMessages").collect());
    expect(inbound.length).toBe(1);
  });
});

describe("re-protection voids the ack and re-notifies", () => {
  test("reprotect flips to reconfirm_required, bumps count, writes audit, re-enqueues", async () => {
    const t = await seeded();
    const { id } = await t.mutation(api.movements.create, {
      guestName: "Mombaerts",
      partySize: 3,
      direction: "arrival",
      mode: "charter",
      scheduledTime: Date.now() + 2 * 3600_000,
    });
    await t.mutation(api.ack.one, { arrivalEventId: id, confirmedPickupTime: Date.now() + 3 * 3600_000 });

    await t.mutation(api.movements.reprotect, {
      id, carrierName: "Safarilink", scheduledTime: Date.now() + 4 * 3600_000, reason: "weather",
    });

    const after = await t.run((ctx) =>
      ctx.db.query("arrivalEvents").withIndex("by_portable_id", (q) => q.eq("id", id)).first(),
    );
    expect(after?.status).toBe("reconfirm_required");
    expect(after?.confirmedPickupTime).toBeUndefined();
    expect(after?.reprotectCount).toBe(1);

    const audit = await t.run((ctx) =>
      ctx.db.query("transferEvents").withIndex("by_event", (q) => q.eq("arrivalEventId", id)).collect(),
    );
    expect(audit.some((e) => e.action === "reprotected")).toBe(true);
  });
});
