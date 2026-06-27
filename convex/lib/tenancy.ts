// ─────────────────────────────────────────────────────────────────────────────
// DEMO tenancy. Clerk auth is removed for the demo; each app acts as a fixed
// seed organization — the Lodge app is Riverbend, the Air app is Mara Wings.
// The wrappers inject that org as `ctx.org` (+ a representative `ctx.user`) so
// the rest of the function code is unchanged. Cross-tenant guards still apply:
// the Lodge app only sees its own org's movements.
//
// NOTE: this is a demo posture. Production would resolve the org from a verified
// identity (the previous Clerk-based wrapper) rather than picking the seed org.
// ─────────────────────────────────────────────────────────────────────────────
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export type Caller = { user: Doc<"users">; org: Doc<"organizations"> };

async function demoCaller(
  ctx: QueryCtx,
  type: Doc<"organizations">["type"],
): Promise<Caller> {
  const org = await ctx.db
    .query("organizations")
    .withIndex("by_type", (q) => q.eq("type", type))
    .first();
  if (!org) throw new Error(`No demo ${type} organization — run the seed`);
  const user = await ctx.db
    .query("users")
    .withIndex("by_org", (q) => q.eq("orgId", org._id))
    .first();
  if (!user) throw new Error(`No demo ${type} user — run the seed`);
  return { user, org };
}

export const lodgeQuery = customQuery(
  query,
  customCtx(async (ctx) => await demoCaller(ctx, "lodge")),
);
export const lodgeMutation = customMutation(
  mutation,
  customCtx(async (ctx) => await demoCaller(ctx, "lodge")),
);
export const airlineQuery = customQuery(
  query,
  customCtx(async (ctx) => await demoCaller(ctx, "airline")),
);
export const airlineMutation = customMutation(
  mutation,
  customCtx(async (ctx) => await demoCaller(ctx, "airline")),
);

// Resolve the first seed org of a type — used by app-agnostic reads that take an
// explicit `app` argument (notifications, audit).
export async function orgByApp(
  ctx: QueryCtx,
  app: "lodge" | "air",
): Promise<Doc<"organizations">> {
  const type = app === "air" ? "airline" : "lodge";
  const org = await ctx.db
    .query("organizations")
    .withIndex("by_type", (q) => q.eq("type", type))
    .first();
  if (!org) throw new Error(`No demo ${type} organization — run the seed`);
  return org;
}

// ── cross-tenant guards (unchanged) ──────────────────────────────────────────
type DbCtx = { db: QueryCtx["db"] };

export async function requireLodgeMovement(
  ctx: DbCtx,
  org: Doc<"organizations">,
  id: Id<"movements">,
): Promise<Doc<"movements">> {
  const m = await ctx.db.get(id);
  if (!m || m.lodgeId !== org._id) throw new Error("Movement not found");
  return m;
}

export async function requireAirlineMovement(
  ctx: DbCtx,
  org: Doc<"organizations">,
  id: Id<"movements">,
): Promise<Doc<"movements">> {
  const m = await ctx.db.get(id);
  if (!m || m.airlineId !== org._id) throw new Error("Movement not found");
  return m;
}

export async function requireAirlineFlight(
  ctx: DbCtx,
  org: Doc<"organizations">,
  id: Id<"flights">,
): Promise<Doc<"flights">> {
  const f = await ctx.db.get(id);
  if (!f || f.airlineId !== org._id) throw new Error("Flight not found");
  return f;
}

export async function requireLodgeStaff(
  ctx: DbCtx,
  org: Doc<"organizations">,
  id: Id<"staff">,
): Promise<Doc<"staff">> {
  const s = await ctx.db.get(id);
  if (!s || s.lodgeId !== org._id) throw new Error("Staff not found");
  return s;
}

export async function requireLodgeBooking(
  ctx: DbCtx,
  org: Doc<"organizations">,
  id: Id<"bookings">,
): Promise<Doc<"bookings">> {
  const b = await ctx.db.get(id);
  if (!b || b.lodgeId !== org._id) throw new Error("Booking not found");
  return b;
}

export async function assertLinked(
  ctx: DbCtx,
  airlineId: Id<"organizations">,
  lodgeId: Id<"organizations">,
): Promise<void> {
  const link = await ctx.db
    .query("airlineLodgeLinks")
    .withIndex("by_pair", (q) =>
      q.eq("airlineId", airlineId).eq("lodgeId", lodgeId),
    )
    .unique();
  if (!link) throw new Error("Airline is not linked to this lodge");
}
