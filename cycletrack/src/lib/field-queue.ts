"use client";

// Offline event queue for the field PWA. Mutations that fail (typically no
// connectivity) are parked in localStorage and retried manually from
// /field/queue. Payloads are the exact mutation arguments.

import { useCallback, useSyncExternalStore } from "react";

export type QueuedEvent = {
  id: string;
  kind: "signForCustody" | "completeCollection" | "refuseCollection" | "triage";
  label: string;
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
  lastError: string | null;
};

const KEY = "ct-field-queue";
const listeners = new Set<() => void>();

function read(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch {
    return [];
  }
}

let cache: QueuedEvent[] = [];
let cacheRaw: string | null = null;

function snapshot(): QueuedEvent[] {
  if (typeof window === "undefined") return cache;
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = read();
  }
  return cache;
}

function write(events: QueuedEvent[]) {
  window.localStorage.setItem(KEY, JSON.stringify(events));
  cacheRaw = null;
  listeners.forEach((l) => l());
}

export function enqueue(
  kind: QueuedEvent["kind"],
  label: string,
  payload: Record<string, unknown>,
  error: string | null,
) {
  const events = read();
  events.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    label,
    payload,
    createdAt: Date.now(),
    attempts: 1,
    lastError: error,
  });
  write(events);
}

export function dequeue(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function markAttempt(id: string, error: string) {
  write(
    read().map((e) =>
      e.id === id ? { ...e, attempts: e.attempts + 1, lastError: error } : e,
    ),
  );
}

export function useFieldQueue(): QueuedEvent[] {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return useSyncExternalStore(subscribe, snapshot, () => cache);
}
