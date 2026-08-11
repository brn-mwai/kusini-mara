"use client";

// Horizontal proportional bar split into labelled segments, legend beneath.
// Colours come from the chart token series so screens never pick their own.

import { useEffect, useState } from "react";
import { Mono } from "./ui";

function seriesTokens(): string[] {
  const s = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4, 5].map((i) => s.getPropertyValue(`--chart-${i}`).trim());
}

export function StatBar({
  segments,
  formatValue,
}: {
  segments: { label: string; value: number }[];
  formatValue?: (v: number) => string;
}) {
  const [colors, setColors] = useState<string[]>([]);
  useEffect(() => setColors(seriesTokens()), []);
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (colors.length === 0)
    return <div className="skeleton h-3 w-full rounded-full" />;
  const fmt = formatValue ?? ((v: number) => String(v));
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-raised">
        {segments.map((seg, i) =>
          seg.value > 0 && total > 0 ? (
            <div
              key={seg.label}
              style={{
                width: `${(seg.value / total) * 100}%`,
                background: colors[i % colors.length],
              }}
              title={`${seg.label}: ${fmt(seg.value)}`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-[12px]">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="text-ink-secondary">{seg.label}</span>
            <Mono className="text-[12px] text-ink">{fmt(seg.value)}</Mono>
          </div>
        ))}
      </div>
    </div>
  );
}
