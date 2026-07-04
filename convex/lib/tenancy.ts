import { QueryCtx } from "../_generated/server";

// Demo tenancy resolver: the Lodge app acts as the first seeded property + its
// operator. Swaps for a Clerk-JWT resolver (clerkUserId → users → tenant keys)
// when auth is wired — see KUSINI-SCHEMA.md §13/§16.
export async function getDemoLodge(ctx: QueryCtx) {
  const property = await ctx.db.query("properties").first();
  if (!property) {
    throw new Error("No property seeded — run `seed:run` first.");
  }
  const operator = await ctx.db
    .query("organizations")
    .withIndex("by_portable_id", (q) => q.eq("id", property.operatorId))
    .first();
  if (!operator) {
    throw new Error("Property has no operator.");
  }
  return { property, operator };
}
