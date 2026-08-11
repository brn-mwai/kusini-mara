"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True after hydration; false during SSR/prerender. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
