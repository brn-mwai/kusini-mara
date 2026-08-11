import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePartner, requireProducer, requireStaff } from "./lib/auth";

// Workspace identity for the shell of each console.
export const whoami = query({
  args: {
    surface: v.union(
      v.literal("oem"),
      v.literal("partners"),
      v.literal("field"),
      v.literal("admin"),
    ),
  },
  handler: async (ctx, args) => {
    const { org, member } =
      args.surface === "oem"
        ? await requireProducer(ctx)
        : args.surface === "partners"
          ? await requirePartner(ctx)
          : await requireStaff(ctx);
    return {
      org: org.name,
      kind: org.kind,
      member: member.name,
      role: member.role,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);
    const orgs = await ctx.db.query("orgs").collect();
    const permits = await ctx.db.query("permits").collect();
    const batteries = await ctx.db.query("batteries").collect();
    return orgs
      .filter((o) => o.kind !== "operator")
      .map((o) => {
        const theirPermits = permits.filter((p) => p.orgId === o._id);
        return {
          _id: o._id,
          name: o.name,
          kind: o.kind,
          partnerKind: o.partnerKind ?? null,
          status: o.status,
          contactEmail: o.contactEmail ?? null,
          createdAt: o.createdAt,
          permitState:
            theirPermits.length === 0
              ? null
              : theirPermits.some((p) => p.status === "approved")
                ? ("approved" as const)
                : theirPermits.some((p) => p.status === "pending")
                  ? ("pending" as const)
                  : ("rejected" as const),
          unitCount:
            o.kind === "producer"
              ? batteries.filter((b) => b.producerOrgId === o._id).length
              : null,
        };
      });
  },
});

export const setStatus = mutation({
  args: {
    orgId: v.id("orgs"),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("suspended"),
    ),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const org = await ctx.db.get(args.orgId);
    if (!org) throw new Error("Organisation not found");
    if (org.kind === "operator")
      throw new Error("The operator org cannot be changed here");
    await ctx.db.patch(args.orgId, { status: args.status });
  },
});
