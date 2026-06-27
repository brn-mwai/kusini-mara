// ─────────────────────────────────────────────────────────────────────────────
// Centralized tenancy / auth wrapper.
//
// There is NO row-level security. Isolation is enforced here, in code: every
// public query and mutation is built from one of these wrappers, which resolve
// the caller's organization from the verified Clerk identity and inject it as
// `ctx.org` + `ctx.user`. A client-supplied tenant id is never trusted; cross-
// tenant access is rejected by the `require*` guards below.
// ─────────────────────────────────────────────────────────────────────────────
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export type Caller = { user: Doc<"users">; org: Doc<"organizations"> };

async function resolveCaller(ctx: QueryCtx): Promise<Caller> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) throw new Error("No Kusini account is linked to this identity");
  const org = await ctx.db.get(user.orgId);
  if (!org) throw new Error("Account organization is missing");
  return { user, org };
}

function assertType(caller: Caller, type: Doc<"organizations">["type"]): Caller {
  if (caller.org.type !== type) {
    throw new Error(`This action requires a ${type} account`);
  }
  return caller;
}

// Any authenticated org (lodge or airline).
export const orgQuery = customQuery(
  query,
  customCtx(async (ctx) => await resolveCaller(ctx)),
);
export const orgMutation = customMutation(
  mutation,
  customCtx(async (ctx) => await resolveCaller(ctx)),
);

// Lodge-only surface.
export const lodgeQuery = customQuery(
  query,
  customCtx(async (ctx) => assertType(await resolveCaller(ctx), "lodge")),
);
export const lodgeMutation = customMutation(
  mutation,
  customCtx(async (ctx) => assertType(await resolveCaller(ctx), "lodge")),
);

// Airline-only surface.
export const airlineQuery = customQuery(
  query,
  customCtx(async (ctx) => assertType(await resolveCaller(ctx), "airline")),
);
export const airlineMutation = customMutation(
  mutation,
  customCtx(async (ctx) => assertType(await resolveCaller(ctx), "airline")),
);

// ── cross-tenant guards ──────────────────────────────────────────────────────
// Every resource fetch by id goes through one of these. They throw an identical
// "not found" for both missing rows and wrong-tenant rows so callers cannot
// probe another org's id space.
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

// Verify an airline is contracted to a lodge before it can schedule that lodge's
// movements onto its flights.
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
