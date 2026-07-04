// ─────────────────────────────────────────────────────────────────────────────
// DEMO tenancy (v2). Clerk is removed for the demo; each app acts as a fixed
// seed org — the Lodge app is the first property (Riverbend, under its operator),
// the Air app is the first airline (Mara Wings). Wrappers inject the resolved
// org as ctx.property/ctx.airline (+ a representative ctx.user). Cross-tenant
// guards still hold: a property only sees its own arrivals.
//
// Production would resolve the org from a verified identity instead of the seed.
// ─────────────────────────────────────────────────────────────────────────────
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export type PropertyCaller = {
  user: Doc<"users">;
  property: Doc<"properties">;
  operator: Doc<"operators"> | null;
};
export type AirlineCaller = { user: Doc<"users">; airline: Doc<"airlines"> };

async function demoProperty(ctx: QueryCtx): Promise<PropertyCaller> {
  const property = await ctx.db.query("properties").first();
  if (!property) throw new Error("No demo property — run the seed");
  const user = await ctx.db
    .query("users")
    .withIndex("by_property", (q) => q.eq("propertyId", property._id))
    .first();
  if (!user) throw new Error("No demo property user — run the seed");
  const operator = await ctx.db.get(property.operatorId);
  return { user, property, operator };
}

async function demoAirline(ctx: QueryCtx): Promise<AirlineCaller> {
  const airline = await ctx.db.query("airlines").first();
  if (!airline) throw new Error("No demo airline — run the seed");
  const user = await ctx.db
    .query("users")
    .withIndex("by_airline", (q) => q.eq("airlineId", airline._id))
    .first();
  if (!user) throw new Error("No demo airline user — run the seed");
  return { user, airline };
}

export const propertyQuery = customQuery(
  query,
  customCtx(async (ctx) => await demoProperty(ctx)),
);
export const propertyMutation = customMutation(
  mutation,
  customCtx(async (ctx) => await demoProperty(ctx)),
);
export const airlineQuery = customQuery(
  query,
  customCtx(async (ctx) => await demoAirline(ctx)),
);
export const airlineMutation = customMutation(
  mutation,
  customCtx(async (ctx) => await demoAirline(ctx)),
);

export async function orgByApp(ctx: QueryCtx, app: "lodge" | "air") {
  if (app === "air") {
    const a = await ctx.db.query("airlines").first();
    if (!a) throw new Error("No demo airline — run the seed");
    return { airlineId: a._id as Id<"airlines">, propertyId: undefined };
  }
  const p = await ctx.db.query("properties").first();
  if (!p) throw new Error("No demo property — run the seed");
  return { propertyId: p._id as Id<"properties">, airlineId: undefined };
}

// ── cross-tenant guards ──────────────────────────────────────────────────────
type DbCtx = { db: QueryCtx["db"] };

export async function requirePropertyArrival(
  ctx: DbCtx,
  property: Doc<"properties">,
  id: Id<"arrivalEvents">,
): Promise<Doc<"arrivalEvents">> {
  const a = await ctx.db.get(id);
  if (!a || a.propertyId !== property._id) throw new Error("Arrival not found");
  return a;
}

export async function requireAirlineArrival(
  ctx: DbCtx,
  airline: Doc<"airlines">,
  id: Id<"arrivalEvents">,
): Promise<Doc<"arrivalEvents">> {
  const a = await ctx.db.get(id);
  if (!a || a.airlineId !== airline._id) throw new Error("Arrival not found");
  return a;
}

export async function requireAirlineFlight(
  ctx: DbCtx,
  airline: Doc<"airlines">,
  id: Id<"flights">,
): Promise<Doc<"flights">> {
  const f = await ctx.db.get(id);
  if (!f || f.airlineId !== airline._id) throw new Error("Flight not found");
  return f;
}

export async function requirePropertyStaff(
  ctx: DbCtx,
  property: Doc<"properties">,
  id: Id<"staff">,
): Promise<Doc<"staff">> {
  const s = await ctx.db.get(id);
  if (!s || s.propertyId !== property._id) throw new Error("Staff not found");
  return s;
}

export async function requirePropertyVehicle(
  ctx: DbCtx,
  property: Doc<"properties">,
  id: Id<"vehicles">,
): Promise<Doc<"vehicles">> {
  const veh = await ctx.db.get(id);
  if (!veh || veh.propertyId !== property._id) throw new Error("Vehicle not found");
  return veh;
}

export async function assertLinked(
  ctx: DbCtx,
  airlineId: Id<"airlines">,
  propertyId: Id<"properties">,
): Promise<void> {
  const link = await ctx.db
    .query("airlinePropertyLinks")
    .withIndex("by_pair", (q) =>
      q.eq("airlineId", airlineId).eq("propertyId", propertyId),
    )
    .unique();
  if (!link) throw new Error("Airline is not linked to this property");
}
