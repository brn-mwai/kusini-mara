import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { orgQuery } from "./lib/tenancy";

// Current account (user + org) for the signed-in caller. Null if not linked yet.
export const me = orgQuery({
  args: {},
  returns: v.object({
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    org: v.object({
      id: v.id("organizations"),
      name: v.string(),
      type: v.union(v.literal("airline"), v.literal("lodge")),
      shortCode: v.string(),
    }),
  }),
  handler: async (ctx) => ({
    userId: ctx.user._id,
    name: ctx.user.name,
    role: ctx.user.role,
    org: {
      id: ctx.org._id,
      name: ctx.org.name,
      type: ctx.org.type,
      shortCode: ctx.org.shortCode,
    },
  }),
});

// Link the signed-in Clerk identity to an organization on first use. The app
// kind decides which org type to join; for the pilot, lodge users join the
// `defaultShortCode` lodge (Riverbend) and air users join Mara Wings. Idempotent.
export const ensureForApp = mutation({
  args: {
    app: v.union(v.literal("lodge"), v.literal("air")),
    orgShortCode: v.optional(v.string()),
  },
  returns: v.object({ linked: v.boolean(), orgName: v.string() }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (existing) {
      const org = await ctx.db.get(existing.orgId);
      return { linked: true, orgName: org?.name ?? "" };
    }

    const wantType = args.app === "air" ? "airline" : "lodge";
    const code = args.orgShortCode ?? (args.app === "air" ? "MW" : "R");
    let org = await ctx.db
      .query("organizations")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", code))
      .first();
    if (!org || org.type !== wantType) {
      org = await ctx.db
        .query("organizations")
        .withIndex("by_type", (q) => q.eq("type", wantType))
        .first();
    }
    if (!org) throw new Error("No organization to join — run the seed first");

    await ctx.db.insert("users", {
      orgId: org._id,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.email ?? "Kusini user",
      role: args.app === "air" ? "ops" : "duty_contact",
      email: identity.email,
      phone: undefined,
    });
    return { linked: true, orgName: org.name };
  },
});
