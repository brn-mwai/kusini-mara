// ─────────────────────────────────────────────────────────────────────────────
// Caller resolution. With a verified Clerk identity, the caller is the member
// row matching `tokenIdentifier` and authorisation flows from their org — never
// from an argument. Without one (the four Clerk console apps are not yet
// provisioned), each surface falls back to a fixed seed org, mirroring the
// Kusini demo-tenancy convention in this repository. Cross-tenant guards hold
// either way: a producer only sees its own batteries.
// ─────────────────────────────────────────────────────────────────────────────
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type Caller = { org: Doc<"orgs">; member: Doc<"members"> };

type Ctx = QueryCtx | MutationCtx;

async function memberFromIdentity(ctx: Ctx): Promise<Caller | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const member = await ctx.db
    .query("members")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!member) throw new Error("Signed in, but not a member of any workspace");
  const org = await ctx.db.get(member.orgId);
  if (!org) throw new Error("Workspace not found");
  return { org, member };
}

async function demoCaller(
  ctx: Ctx,
  kind: Doc<"orgs">["kind"],
  partnerKind?: "second_life" | "recycler",
): Promise<Caller> {
  const orgs = await ctx.db
    .query("orgs")
    .withIndex("by_kind", (q) => q.eq("kind", kind))
    .collect();
  const org =
    (partnerKind ? orgs.find((o) => o.partnerKind === partnerKind) : orgs[0]) ??
    orgs[0];
  if (!org) throw new Error(`No demo ${kind} org — run the seed`);
  const member = await ctx.db
    .query("members")
    .withIndex("by_org", (q) => q.eq("orgId", org._id))
    .first();
  if (!member) throw new Error(`No demo ${kind} member — run the seed`);
  return { org, member };
}

async function requireKind(ctx: Ctx, kind: Doc<"orgs">["kind"]) {
  const fromIdentity = await memberFromIdentity(ctx);
  if (fromIdentity) {
    if (fromIdentity.org.kind !== kind)
      throw new Error(`This console requires a ${kind} workspace`);
    return fromIdentity;
  }
  return demoCaller(ctx, kind);
}

/** Producer console (/oem). */
export const requireProducer = (ctx: Ctx) => requireKind(ctx, "producer");

/** Partner console (/partners). */
export const requirePartner = (ctx: Ctx) => requireKind(ctx, "partner");

/** Control tower and field crew (/admin, /field) — the operator org. */
export const requireStaff = (ctx: Ctx) => requireKind(ctx, "operator");
