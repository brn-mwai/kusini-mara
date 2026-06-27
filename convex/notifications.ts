import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { orgQuery } from "./lib/tenancy";
import { notifyChannel } from "./schema";
import { sendSms, sendWhatsApp } from "./lib/providers";
import type { Id } from "./_generated/dataModel";

// Read the notifications log for the caller's org (either tenant key matches).
export const list = orgQuery({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const isLodge = ctx.org.type === "lodge";
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_at")
      .order("desc")
      .take(100);
    return rows.filter((n) =>
      isLodge ? n.lodgeId === ctx.org._id : n.airlineId === ctx.org._id,
    );
  },
});

// Enqueue a notification (outbox row in `pending`) and schedule delivery. Called
// from mutations (e.g. escalation) — mutations can't do network I/O, so the
// actual send happens in the scheduled action.
export const enqueue = internalMutation({
  args: {
    channel: notifyChannel,
    toPhone: v.optional(v.string()),
    toUserId: v.optional(v.id("users")),
    movementId: v.optional(v.id("movements")),
    lodgeId: v.optional(v.id("organizations")),
    airlineId: v.optional(v.id("organizations")),
    kind: v.string(),
    body: v.string(),
    correlationId: v.optional(v.string()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("notifications", {
      at: Date.now(),
      channel: args.channel,
      status: "pending",
      toPhone: args.toPhone,
      toUserId: args.toUserId,
      movementId: args.movementId,
      lodgeId: args.lodgeId,
      airlineId: args.airlineId,
      kind: args.kind,
      body: args.body,
      delivered: false,
      attempts: 0,
      correlationId: args.correlationId,
    });
    await ctx.scheduler.runAfter(0, internal.notifications.deliver, { id });
    return id;
  },
});

export const _get = internalQuery({
  args: { id: v.id("notifications") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const _mark = internalMutation({
  args: {
    id: v.id("notifications"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    channel: notifyChannel,
    delivered: v.boolean(),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    await ctx.db.patch(args.id, {
      status: args.status,
      channel: args.channel,
      delivered: args.delivered,
      attempts: row.attempts + 1,
      lastError: args.error,
    });
    return null;
  },
});

// Deliver a queued notification over its channel. Falls back to a recorded mock
// when provider creds are absent — the escalation stays auditable either way.
export const deliver = internalAction({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const n = await ctx.runQuery(internal.notifications._get, { id: args.id });
    if (!n || n.status === "sent") return null;
    if (!n.toPhone) {
      await ctx.runMutation(internal.notifications._mark, {
        id: args.id,
        status: "sent",
        channel: "mock",
        delivered: false,
        error: "no recipient phone",
      });
      return null;
    }
    const result =
      n.channel === "whatsapp"
        ? await sendWhatsApp(n.toPhone, n.body)
        : await sendSms(n.toPhone, n.body);
    await ctx.runMutation(internal.notifications._mark, {
      id: args.id,
      status: result.delivered ? "sent" : result.channel === "mock" ? "sent" : "failed",
      channel: result.channel,
      delivered: result.delivered,
      error: result.error,
    });
    return null;
  },
});
