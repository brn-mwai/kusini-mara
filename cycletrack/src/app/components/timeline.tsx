"use client";

import type { ReactNode } from "react";
import { Mono } from "./ui";
import { formatDateTime } from "@/lib/format";

export type TimelineEntry = {
  key: string;
  title: string;
  at: number;
  note?: ReactNode;
  tone?: "default" | "danger" | "success";
};

// Vertical rail with dots and a connecting line.
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative">
      {entries.map((e, i) => (
        <li key={e.key} className="relative flex gap-3 pb-5 last:pb-0">
          {i < entries.length - 1 ? (
            <span
              aria-hidden
              className="absolute left-[5px] top-3.5 h-full w-px bg-line"
            />
          ) : null}
          <span
            aria-hidden
            className={`relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-card ${
              e.tone === "danger"
                ? "bg-danger"
                : e.tone === "success"
                  ? "bg-success"
                  : "bg-ink-tertiary"
            }`}
            style={{ boxShadow: "0 0 0 1px var(--border)" }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-[13px] font-medium text-ink">
                {e.title}
              </span>
              <Mono className="text-[12px] text-ink-tertiary">
                {formatDateTime(e.at)}
              </Mono>
            </div>
            {e.note ? (
              <div className="mt-0.5 text-[13px] text-ink-secondary">
                {e.note}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
