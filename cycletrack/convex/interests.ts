import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePartner, requireStaff } from "./lib/auth";
import { orgNames } from "./lib/joins";

export const express = mutation({
  args: { batteryId: v.id("batteries"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { org } = await requirePartner(ctx);
    const permits = await ctx.db
      .query("permits")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();
    if (!permits.some((p) => p.status === "approved"))
      throw new Error("An approved permit is required before expressing interest");
    const battery = await ctx.db.get(args.batteryId);
    if (!battery) throw new Error("Battery not found");
    const existing = await ctx.db
      .query("interests")
      .withIndex("by_battery", (q) => q.eq("batteryId", args.batteryId))
      .collect();
    if (
      existing.some(
        (i) => i.partnerOrgId === org._id && i.status === "open",
      )
    )
      throw new Error("Interest already open for this unit");
    await ctx.db.insert("interests", {
      partnerOrgId: org._id,
      batteryId: args.batteryId,
      status: "open",
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

export const myInterests = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requirePartner(ctx);
    const rows = await ctx.db
      .query("interests")
      .withIndex("by_partner", (q) => q.eq("partnerOrgId", org._id))
      .collect();
    const out = [];
    for (const i of rows.sort((a, b) => b.createdAt - a.createdAt)) {
      const battery = await ctx.db.get(i.batteryId);
      out.push({
        _id: i._id,
        tag: battery?.tag ?? "—",
        chemistry: battery?.chemistry ?? null,
        massKg: battery?.massKg ?? null,
        status: i.status,
        note: i.note ?? null,
        createdAt: i.createdAt,
      });
    }
    return out;
  },
});

export const withdraw = mutation({
  args: { interestId: v.id("interests") },
  handler: async (ctx, args) => {
    const { org } = await requirePartner(ctx);
    const interest = await ctx.db.get(args.interestId);
    if (!interest || interest.partnerOrgId !== org._id)
      throw new Error("Interest not found");
    if (interest.status !== "open") throw new Error("No longer open");
    await ctx.db.patch(args.interestId, { status: "withdrawn" });
  },
});

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const names = await orgNames(ctx);
    const rows = await ctx.db
      .query("interests")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
    const out = [];
    for (const i of rows.sort((a, b) => b.createdAt - a.createdAt)) {
      const battery = await ctx.db.get(i.batteryId);
      out.push({
        _id: i._id,
        partner: names.get(i.partnerOrgId) ?? "—",
        tag: battery?.tag ?? "—",
        note: i.note ?? null,
        createdAt: i.createdAt,
      });
    }
    return out;
  },
});
