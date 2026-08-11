"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ArrowsClockwise, CloudCheck } from "@phosphor-icons/react";
import { EmptyState, Mono } from "@/app/components/ui";
import {
  dequeue,
  markAttempt,
  useFieldQueue,
  type QueuedEvent,
} from "@/lib/field-queue";
import { formatTimeAgo } from "@/lib/format";

export default function FieldQueue() {
  const queue = useFieldQueue();
  const signForCustody = useMutation(api.trail.signForCustody);
  const completeCollection = useMutation(api.collections.completeCollection);
  const refuseCollection = useMutation(api.collections.refuseCollection);
  const triage = useMutation(api.batteries.triageQuarantine);
  const [retrying, setRetrying] = useState<string | null>(null);

  const replay = async (event: QueuedEvent) => {
    const p = event.payload;
    switch (event.kind) {
      case "signForCustody":
        return signForCustody({ batteryId: p.batteryId as Id<"batteries"> });
      case "completeCollection":
        return completeCollection({
          collectionId: p.collectionId as Id<"collections">,
          massKg: p.massKg as number,
          unitCount: p.unitCount as number,
          tempOk: p.tempOk as boolean,
          signatureHash: p.signatureHash as string,
        });
      case "refuseCollection":
        return refuseCollection({
          collectionId: p.collectionId as Id<"collections">,
          reason: p.reason as string,
        });
      case "triage":
        return triage({
          batteryId: p.batteryId as Id<"batteries">,
          condition: p.condition as "leaking" | "swollen" | "thermal",
        });
    }
  };

  const retry = (event: QueuedEvent) => {
    setRetrying(event.id);
    replay(event)
      .then(() => dequeue(event.id))
      .catch((e) => {
        const message = e instanceof Error ? e.message : "Failed";
        // A duplicate/validation error means the server already has it.
        if (/already/i.test(message)) dequeue(event.id);
        else markAttempt(event.id, message);
      })
      .finally(() => setRetrying(null));
  };

  return (
    <div>
      <h1 className="text-page-title mb-1">Sync queue</h1>
      <p className="mb-4 text-[13px] text-ink-secondary">
        {queue.length === 0 ? (
          "Everything is synced."
        ) : (
          <>
            <Mono className="font-medium">{queue.length}</Mono> unsynced event
            {queue.length === 1 ? "" : "s"} waiting for a connection.
          </>
        )}
      </p>

      {queue.length === 0 ? (
        <EmptyState
          icon={CloudCheck}
          title="Queue is empty"
          body="Events recorded offline are parked here until they sync."
        />
      ) : (
        <ul className="space-y-3">
          {queue.map((event) => (
            <li
              key={event.id}
              className="rounded-card border border-line bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-ink">
                  {event.label}
                </span>
                <Mono className="text-[11px] text-ink-tertiary">
                  {formatTimeAgo(event.createdAt)}
                </Mono>
              </div>
              <div className="mt-1 text-[12px] text-ink-secondary">
                {event.attempts} attempt{event.attempts === 1 ? "" : "s"}
                {event.lastError ? ` · ${event.lastError}` : ""}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={retrying === event.id}
                  onClick={() => retry(event)}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-ctl bg-brand text-[14px] font-medium text-white disabled:opacity-50"
                >
                  <ArrowsClockwise size={16} aria-hidden />
                  {retrying === event.id ? "Retrying…" : "Retry now"}
                </button>
                <button
                  type="button"
                  onClick={() => dequeue(event.id)}
                  className="h-12 rounded-ctl border border-line bg-card px-4 text-[14px] font-medium text-ink-secondary"
                >
                  Discard
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
