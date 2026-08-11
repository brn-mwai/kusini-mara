import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePartner, requireStaff } from "./lib/auth";
import { orgNames } from "./lib/joins";

const permitKindV = v.union(
  v.literal("waste_carrier"),
  v.literal("recycler_licence"),
  v.literal("second_life_cert"),
);

export const myPermits = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requirePartner(ctx);
    const rows = await ctx.db
      .query("permits")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();
    return rows
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .map((p) => ({
        _id: p._id,
        kind: p.kind,
        filename: p.filename,
        fileSizeBytes: p.fileSizeBytes ?? null,
        status: p.status,
        reviewerNote: p.reviewerNote ?? null,
        submittedAt: p.submittedAt,
        reviewedAt: p.reviewedAt ?? null,
      }));
  },
});

/** Gate for "Express interest": at least one approved permit. */
export const myPermitState = query({
  args: {},
  handler: async (ctx) => {
    const { org } = await requirePartner(ctx);
    const rows = await ctx.db
      .query("permits")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();
    return {
      approved: rows.some((p) => p.status === "approved"),
      pending: rows.some((p) => p.status === "pending"),
    };
  },
});

export const submitPermit = mutation({
  args: {
    kind: permitKindV,
    filename: v.string(),
    fileSizeBytes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { org } = await requirePartner(ctx);
    await ctx.db.insert("permits", {
      orgId: org._id,
      kind: args.kind,
      filename: args.filename,
      fileSizeBytes: args.fileSizeBytes,
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

export const reviewQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const names = await orgNames(ctx);
    const rows = await ctx.db.query("permits").collect();
    return rows
      .sort((a, b) => b.submittedAt - a.submittedAt)
      .map((p) => ({
        _id: p._id,
        org: names.get(p.orgId) ?? "—",
        kind: p.kind,
        filename: p.filename,
        status: p.status,
        reviewerNote: p.reviewerNote ?? null,
        submittedAt: p.submittedAt,
        reviewedAt: p.reviewedAt ?? null,
      }));
  },
});

export const review = mutation({
  args: {
    permitId: v.id("permits"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const permit = await ctx.db.get(args.permitId);
    if (!permit) throw new Error("Permit not found");
    if (permit.status !== "pending") throw new Error("Already reviewed");
    await ctx.db.patch(args.permitId, {
      status: args.decision,
      reviewerNote: args.note,
      reviewedAt: Date.now(),
    });
    if (args.decision === "approved") {
      const org = await ctx.db.get(permit.orgId);
      if (org && org.status === "pending")
        await ctx.db.patch(permit.orgId, { status: "active" });
    }
  },
});
