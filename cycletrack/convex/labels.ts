import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireStaff } from "./lib/auth";
import { sha256Hex } from "./lib/sha256";

export const batches = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const batches = await ctx.db.query("labelBatches").collect();
    const tokens = await ctx.db.query("labelTokens").collect();
    return batches
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((batch) => {
        const mine = tokens.filter((t) => t.batchId === batch._id);
        return {
          _id: batch._id,
          code: batch.code,
          count: batch.count,
          createdAt: batch.createdAt,
          printedAt: batch.printedAt ?? null,
          printed: mine.filter((t) => t.state !== "generated").length,
          bound: mine.filter((t) => t.state === "bound").length,
          revoked: mine.filter((t) => t.state === "revoked").length,
        };
      });
  },
});

export const batchTokens = query({
  args: { batchId: v.id("labelBatches") },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const rows = await ctx.db
      .query("labelTokens")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();
    return rows.map((t) => ({ _id: t._id, token: t.token, state: t.state }));
  },
});

export const generateBatch = mutation({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    if (!Number.isInteger(args.count) || args.count < 1 || args.count > 500)
      throw new Error("Count must be between 1 and 500");
    const now = Date.now();
    const existing = await ctx.db.query("labelBatches").collect();
    const code = `LB-${String(existing.length + 1).padStart(3, "0")}`;
    const batchId = await ctx.db.insert("labelBatches", {
      code,
      count: args.count,
      createdAt: now,
    });
    for (let i = 0; i < args.count; i++) {
      await ctx.db.insert("labelTokens", {
        batchId,
        token: sha256Hex(`${code}|${now}|${i}`).slice(0, 12),
        state: "generated",
      });
    }
    return { batchId, code };
  },
});

export const markPrinted = mutation({
  args: { batchId: v.id("labelBatches") },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const batch = await ctx.db.get(args.batchId);
    if (!batch) throw new Error("Batch not found");
    const tokens = await ctx.db
      .query("labelTokens")
      .withIndex("by_batch", (q) => q.eq("batchId", args.batchId))
      .collect();
    for (const t of tokens) {
      if (t.state === "generated")
        await ctx.db.patch(t._id, { state: "printed" });
    }
    await ctx.db.patch(args.batchId, { printedAt: Date.now() });
  },
});

export const revokeToken = mutation({
  args: { tokenId: v.id("labelTokens") },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const token = await ctx.db.get(args.tokenId);
    if (!token) throw new Error("Token not found");
    if (token.state === "bound")
      throw new Error("Bound tokens cannot be revoked");
    await ctx.db.patch(args.tokenId, { state: "revoked" });
  },
});
