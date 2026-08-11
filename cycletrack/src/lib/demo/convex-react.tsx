"use client";

// Screenshot/demo shim for "convex/react". Active ONLY when the dev server is
// started with FIXTURE_DEMO=1 (see next.config.ts) — production builds resolve
// the real package. Serves the outputs captured from the real backend running
// in-memory (tests/gen-fixtures.test.ts); mutations are inert.

import type { ReactNode } from "react";
import { getFunctionName } from "convex/server";
import demo from "./fixtures.json";

const fixtures = (demo as { fixtures: Record<string, unknown> }).fixtures;

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

function keyFor(name: string, args: unknown): string {
  const clean = JSON.parse(JSON.stringify(args ?? {}));
  return `${name}|${JSON.stringify(sortDeep(clean))}`;
}

export class ConvexReactClient {
  constructor(_url: string) {}
  close() {}
}

export function ConvexProvider({
  children,
}: {
  client?: unknown;
  children: ReactNode;
}) {
  return <>{children}</>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuery(ref: any, args?: any): any {
  if (args === "skip") return undefined;
  const key = keyFor(getFunctionName(ref), args);
  if (!(key in fixtures)) {
    // Loading state is the honest render for anything we did not capture.
    if (typeof window !== "undefined") console.warn("[demo] no fixture:", key);
    return undefined;
  }
  return fixtures[key];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation(_ref: any): any {
  return async () => {
    throw new Error("Read-only demo — mutations need a live Convex deployment");
  };
}
