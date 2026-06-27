// Convex validates Clerk-issued JWTs against this issuer. Create a Clerk JWT
// template named "convex" (Clerk dashboard → JWT Templates) — its Issuer URL is
// CLERK_JWT_ISSUER_DOMAIN. Set the var in the Convex dashboard, not in code.
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
