import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireProducer } from "./lib/auth";
import { sha256Hex } from "./lib/sha256";

// A chain-of-custody report's content hash is deterministic over the producer's
// event hashes in the period, so verification can recompute and compare.
export async function contentHashFor(
  ctx: QueryCtx,
  orgId: Id<"orgs">,
  periodStart: number,
  periodEnd: number,
): Promise<{ hash: string; eventCount: number }> {
  const batteries = await ctx.db
    .query("batteries")
    .withIndex("by_producer", (q) => q.eq("producerOrgId", orgId))
    .collect();
  const ids = new Set(batteries.map((b) => b._id));
  const custody = await ctx.db.query("custodyEvents").collect();
  const unit = await ctx.db.query("batteryEvents").collect();
  const hashes = [
    ...custody.filter(
      (e) =>
        e.batteryId !== undefined &&
        ids.has(e.batteryId) &&
        e.at >= periodStart &&
        e.at < periodEnd,
    ),
    ...unit.filter(
      (e) => ids.has(e.batteryId) && e.at >= periodStart && e.at < periodEnd,
    ),
  ]
    .sort((a, b) => a.at - b.at || a.hash.localeCompare(b.hash))
    .map((e) => e.hash);
  return { hash: sha256Hex(hashes.join("|")), eventCount: hashes.length };
}

export const myReports = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requireProducer(ctx);
    const rows = await ctx.db
      .query("reports")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();
    return rows
      .sort((a, b) => b.issuedAt - a.issuedAt)
      .map((r) => ({
        _id: r._id,
        reportId: r.reportId,
        contentHash: r.contentHash,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        eventCount: r.eventCount,
        issuedAt: r.issuedAt,
      }));
  },
});

export const generate = mutation({
  args: { periodStart: v.number(), periodEnd: v.number() },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    if (!(args.periodStart < args.periodEnd))
      throw new Error("Period start must precede period end");
    const { hash, eventCount } = await contentHashFor(
      ctx,
      org._id,
      args.periodStart,
      args.periodEnd,
    );
    if (eventCount === 0)
      throw new Error("No events in this period — nothing to certify");
    const issuedAt = Date.now();
    const reportId = `CC-${sha256Hex(`${org._id}|${issuedAt}`)
      .slice(0, 8)
      .toUpperCase()}`;
    await ctx.db.insert("reports", {
      reportId,
      kind: "chain_of_custody",
      orgId: org._id,
      contentHash: hash,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      eventCount,
      issuedAt,
    });
    return { reportId };
  },
});

// Public verification (/v/[reportId]): recompute and compare.
export const verify = query({
  args: { reportId: v.string() },
  handler: async (ctx, args) => {
    const report = await ctx.db
      .query("reports")
      .withIndex("by_reportId", (q) => q.eq("reportId", args.reportId))
      .unique();
    if (!report) return { found: false as const };
    const { hash } = await contentHashFor(
      ctx,
      report.orgId,
      report.periodStart,
      report.periodEnd,
    );
    return {
      found: true as const,
      reportId: report.reportId,
      contentHash: report.contentHash,
      issuedAt: report.issuedAt,
      eventCount: report.eventCount,
      match: hash === report.contentHash,
    };
  },
});

// The printable certificate for /oem/records.
export const certificate = query({
  args: { reportId: v.string() },
  handler: async (ctx, args) => {
    const { org } = await requireProducer(ctx);
    const report = await ctx.db
      .query("reports")
      .withIndex("by_reportId", (q) => q.eq("reportId", args.reportId))
      .unique();
    if (!report || report.orgId !== org._id) return null;
    return {
      reportId: report.reportId,
      org: org.name,
      contentHash: report.contentHash,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      eventCount: report.eventCount,
      issuedAt: report.issuedAt,
    };
  },
});
