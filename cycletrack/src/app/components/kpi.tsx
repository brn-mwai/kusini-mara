"use client";

import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react";
import { Skeleton } from "./ui";
import { Sparkline } from "./chart";

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  icon: IconCmp,
  label,
  value,
  delta,
  sparkline,
}: {
  icon: Icon;
  label: string;
  /** Pre-formatted value; undefined renders the loading skeleton. */
  value: string | undefined;
  /** Percentage vs last month; positive renders up/success. */
  delta?: number;
  sparkline?: number[];
}) {
  return (
    <div className="rounded-card border border-line bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex size-8 items-center justify-center rounded-ctl bg-brand-subtle text-brand">
          <IconCmp size={16} aria-hidden />
        </div>
      </div>
      <div className="mt-3 text-[13px] text-ink-secondary">{label}</div>
      {value === undefined ? (
        <Skeleton className="mt-1 h-8 w-24" />
      ) : (
        <div className="mono mt-0.5 text-[26px] font-bold leading-9 text-ink">
          {value}
        </div>
      )}
      {delta !== undefined ? (
        <div className="mt-1 flex items-center gap-1 text-[12px]">
          {delta >= 0 ? (
            <ArrowUpRight size={14} className="text-success" aria-hidden />
          ) : (
            <ArrowDownRight size={14} className="text-danger" aria-hidden />
          )}
          <span
            className={`mono ${delta >= 0 ? "text-success" : "text-danger"}`}
          >
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-ink-tertiary">vs last month</span>
        </div>
      ) : null}
      {sparkline && sparkline.length > 1 ? (
        <div className="mt-2">
          <Sparkline values={sparkline} />
        </div>
      ) : null}
    </div>
  );
}
