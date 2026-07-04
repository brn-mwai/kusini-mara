import { QueryCtx } from "../_generated/server";

// Demo tenancy resolver: the Lodge app acts as the first seeded property + its
// operator. Swaps for a Clerk-JWT resolver (clerkUserId → users → tenant keys)
// when auth is wired — see KUSINI-SCHEMA.md §13/§16.
export async function getDemoLodge(ctx: QueryCtx) {
  const tenant = await getDemoLodgeOrNull(ctx);
  if (!tenant) {
    throw new Error("No property seeded — run `seed:run` first.");
  }
  return tenant;
}

// Query-safe variant: reads return null while unseeded (e.g. mid-reseed) instead
// of poisoning the reactive subscription with a thrown error.
export async function getDemoLodgeOrNull(ctx: QueryCtx) {
  const property = await ctx.db.query("properties").first();
  if (!property) return null;
  const operator = await ctx.db
    .query("organizations")
    .withIndex("by_portable_id", (q) => q.eq("id", property.operatorId))
    .first();
  if (!operator) return null;
  return { property, operator };
}
