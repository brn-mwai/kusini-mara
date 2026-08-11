"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { BatteryHigh, Fire, MagnifyingGlass, Package } from "@phosphor-icons/react";
import { PublicChrome } from "@/app/components/public-chrome";
import { Timeline } from "@/app/components/timeline";
import { Badge, EmptyState, Mono, Skeleton } from "@/app/components/ui";
import { STAGE_LABEL } from "@/lib/format";

// The public record: identity, chemistry class, stage and movement timeline.
// Deliberately excludes actors, organisations, addresses and weights.
function PublicRecord({ token }: { token: string }) {
  const record = useQuery(api.trail.publicTrail, { token });

  return (
    <div className="mx-auto max-w-xl">
      {record === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64" />
        </div>
      ) : record === null ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No record found"
          body="This code does not match a battery on the CycleTrack registry. Check the label and try again."
        />
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-ctl bg-brand-subtle text-brand">
              {record.kind === "battery" ? (
                <BatteryHigh size={20} aria-hidden />
              ) : (
                <Package size={20} aria-hidden />
              )}
            </span>
            <div>
              <h1 className="text-page-title">
                <Mono className="text-[20px] font-medium">{record.tag}</Mono>
              </h1>
              <p className="text-[13px] text-ink-secondary">
                {record.kind === "battery"
                  ? `${record.chemistryClass} battery`
                  : "Collection container"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Badge tone="info">
              {record.kind === "battery"
                ? (STAGE_LABEL[record.stage] ?? record.stage)
                : record.stage.replace("_", " ")}
            </Badge>
            {record.kind === "battery" && record.quarantined ? (
              <Badge tone="danger">Held for safety</Badge>
            ) : null}
            {record.kind === "battery" && record.disposition ? (
              <Badge tone="success">{record.disposition}</Badge>
            ) : null}
          </div>

          <div className="mt-6 rounded-card border border-line bg-card p-5 shadow-sm">
            <h2 className="text-card-title mb-4">Journey</h2>
            {record.events.length === 0 ? (
              <p className="text-[13px] text-ink-secondary">
                No movements recorded yet.
              </p>
            ) : (
              <Timeline
                entries={record.events.map((e, i) => ({
                  key: `${e.at}-${i}`,
                  title: e.label,
                  at: e.at,
                }))}
              />
            )}
          </div>

          {record.kind === "battery" && record.disposition ? (
            <p className="mt-4 rounded-card border border-line bg-card p-4 text-[13px] text-ink-secondary">
              Final disposition:{" "}
              <span className="font-medium text-ink">{record.disposition}</span>
            </p>
          ) : null}

          <div className="mt-6 flex items-start gap-2.5 rounded-card border border-danger/30 bg-danger-bg p-4">
            <Fire size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden />
            <p className="text-[13px] font-medium leading-5 text-ink">
              If swollen, leaking or hot, do not move it. Leave the area and
              call 999 or 112.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicRecordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  return (
    <PublicChrome>
      <PublicRecord token={token} />
    </PublicChrome>
  );
}
