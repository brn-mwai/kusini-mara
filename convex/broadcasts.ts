import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { channel } from "./schema.master.foundation";
import { getDemoLodge, getDemoLodgeOrNull } from "./lib/tenancy";
import { withStamps, withId } from "./lib/base";

export const board = query({
  args: {},
  handler: async (ctx) => {
    const tenant = await getDemoLodgeOrNull(ctx);
    if (!tenant) return null;
    const { property } = tenant;

    const [broadcasts, lists, members, staff] = await Promise.all([
      ctx.db
        .query("broadcasts")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db
        .query("staffLists")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
      ctx.db.query("staffListMembers").collect(),
      ctx.db
        .query("staff")
        .withIndex("by_property", (q) => q.eq("propertyId", property.id))
        .collect(),
    ]);

    const memberCount = (listId: string, roleFilter?: string | null) => {
      const list = lists.find((l) => l.id === listId);
      if (list?.dynamic && list.roleFilter) {
        return staff.filter((s) => s.active && s.role === list.roleFilter).length;
      }
      return members.filter((m) => m.listId === listId).length;
    };

    return {
      rows: broadcasts
        .map((b) => {
          const list = lists.find((l) => l.id === b.listId);
          return {
            id: b.id,
            listName: list?.name ?? "Ad-hoc",
            channel: b.channel,
            body: b.body,
            status: b.status,
            recipientCount: b.recipientCount ?? 0,
            sentAt: b.sentAt ?? null,
            createdAt: b.createdAt,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt),
      lists: lists.map((l) => ({
        id: l.id,
        name: l.name,
        dynamic: l.dynamic,
        members: memberCount(l.id, l.roleFilter),
      })),
    };
  },
});

// Sends a broadcast: resolves the list to concrete staff, writes one queued
// notifications row per recipient (mock provider until Africa's Talking is wired),
// and marks the broadcast sent.
export const send = mutation({
  args: {
    listId: v.string(),
    channel,
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const { property, operator } = await getDemoLodge(ctx);
    if (args.body.trim() === "") throw new Error("Message body is required.");

    const list = await ctx.db
      .query("staffLists")
      .withIndex("by_portable_id", (q) => q.eq("id", args.listId))
      .first();
    if (!list || list.propertyId !== property.id) throw new Error("List not found.");

    const staff = await ctx.db
      .query("staff")
      .withIndex("by_property", (q) => q.eq("propertyId", property.id))
      .collect();

    let recipients;
    if (list.dynamic && list.roleFilter) {
      recipients = staff.filter((s) => s.active && s.role === list.roleFilter);
    } else {
      const members = await ctx.db
        .query("staffListMembers")
        .withIndex("by_list", (q) => q.eq("listId", list.id))
        .collect();
      recipients = staff.filter((s) => members.some((m) => m.staffId === s.id));
    }
    if (recipients.length === 0) throw new Error("List has no active recipients.");

    const now = Date.now();
    const thread = withStamps(
      {
        propertyId: property.id,
        kind: "broadcast" as const,
        subject: args.body.slice(0, 60),
      },
      now,
    );
    await ctx.db.insert("messageThreads", thread);

    const broadcast = withStamps(
      {
        propertyId: property.id,
        listId: list.id,
        threadId: thread.id,
        channel: args.channel,
        body: args.body.trim(),
        status: "sent" as const,
        sentAt: now,
        recipientCount: recipients.length,
      },
      now,
    );
    await ctx.db.insert("broadcasts", broadcast);

    for (const r of recipients) {
      await ctx.db.insert(
        "notifications",
        withId(
          {
            recipientPhone: r.phones.primaryPhoneNumber,
            channel: args.channel,
            provider: "africas_talking" as const,
            templateKey: "broadcast",
            threadId: thread.id,
            broadcastId: broadcast.id,
            payload: { body: args.body.trim(), staffId: r.id },
            status: "queued" as const,
            retryCount: 0,
            queuedAt: now,
            operatorId: operator.id,
          },
          now,
        ),
      );
    }

    return { id: broadcast.id, recipients: recipients.length };
  },
});
