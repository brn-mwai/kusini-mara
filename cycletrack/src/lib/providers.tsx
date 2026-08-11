"use client";

import { ReactNode, useMemo } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ConsoleKey } from "./console-routes";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

// Four separate Clerk applications, one per console. A console mounts Clerk
// only when its own publishable key is configured; otherwise it runs in the
// repo's demo-tenancy mode (fixed seed org per surface, resolved server-side).
const CLERK_KEYS: Record<ConsoleKey, string | undefined> = {
  oem: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_OEM,
  partners: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PARTNERS,
  field: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_FIELD,
  admin: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_ADMIN,
};

export function clerkEnabled(consoleKey: ConsoleKey): boolean {
  return Boolean(CLERK_KEYS[consoleKey]);
}

let client: ConvexReactClient | null = null;
function convexClient(): ConvexReactClient | null {
  if (!CONVEX_URL) return null;
  if (!client) client = new ConvexReactClient(CONVEX_URL);
  return client;
}

function ConvexSetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-6">
      <div className="max-w-md rounded-card border border-line bg-card p-6 shadow-sm">
        <h1 className="text-card-title">Backend not configured</h1>
        <p className="mt-2 text-[13px] leading-5 text-ink-secondary">
          Set <span className="mono">NEXT_PUBLIC_CONVEX_URL</span> in{" "}
          <span className="mono">.env.local</span>, then run{" "}
          <span className="mono">npx convex dev</span> and{" "}
          <span className="mono">npx convex run seed:run</span> to provision the
          demo deployment.
        </p>
      </div>
    </div>
  );
}

function ClerkedConvex({ children }: { children: ReactNode }) {
  const convex = convexClient()!;
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function ConsoleProviders({
  consoleKey,
  children,
}: {
  consoleKey: ConsoleKey;
  children: ReactNode;
}) {
  const convex = convexClient();
  const clerkKey = CLERK_KEYS[consoleKey];
  if (!convex) return <ConvexSetupNotice />;
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ClerkedConvex>{children}</ClerkedConvex>
      </ClerkProvider>
    );
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function PublicProviders({ children }: { children: ReactNode }) {
  const convex = useMemo(() => convexClient(), []);
  if (!convex) return <ConvexSetupNotice />;
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
