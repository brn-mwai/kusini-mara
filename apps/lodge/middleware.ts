import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Run Clerk only once real keys exist; before that, pass through so the app can
// serve its "setup required" page instead of 500ing on an invalid key.
const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkEnabled = !!pk && pk.startsWith("pk_") && !pk.includes("placeholder");

export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
