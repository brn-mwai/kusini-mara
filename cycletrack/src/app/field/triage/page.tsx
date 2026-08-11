"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Drop,
  Fire,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react";
import { Badge, Mono } from "@/app/components/ui";
import { enqueue } from "@/lib/field-queue";
import { GRADE_LABEL, GRADE_TONE, STAGE_LABEL } from "@/lib/format";

const CONDITIONS = [
  { key: "leaking" as const, label: "Leaking", icon: Drop },
  { key: "swollen" as const, label: "Swollen", icon: Warning },
  { key: "thermal" as const, label: "Thermal damage", icon: Fire },
];

export default function FieldTriage() {
  const [tag, setTag] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [done, setDone] = useState<{ tag: string; condition: string } | null>(
    null,
  );
  const [queued, setQueued] = useState(false);
  const [busy, setBusy] = useState(false);

  const unit = useQuery(
    api.trail.scanLookup,
    submitted ? { tag: submitted } : "skip",
  );
  const triage = useMutation(api.batteries.triageQuarantine);

  const select = (condition: "leaking" | "swollen" | "thermal", label: string) => {
    if (!unit || busy) return;
    setBusy(true);
    // One-way: selecting quarantines immediately.
    triage({ batteryId: unit._id, condition })
      .then(() => setDone({ tag: unit.tag, condition: label }))
      .catch((e) => {
        enqueue(
          "triage",
          `Triage ${label} · ${unit.tag}`,
          { batteryId: unit._id, condition },
          e instanceof Error ? e.message : "Failed",
        );
        setDone({ tag: unit.tag, condition: label });
        setQueued(true);
      })
      .finally(() => setBusy(false));
  };

  if (done) {
    return (
      <div className="rounded-card border border-danger/40 bg-danger-bg p-5">
        <div className="flex items-center gap-2 text-danger">
          <ShieldWarning size={20} aria-hidden />
          <span className="text-card-title text-danger">Unit quarantined</span>
        </div>
        <p className="mt-2 text-[13px] leading-5 text-ink">
          <Mono className="font-medium">{done.tag}</Mono> is held as{" "}
          <span className="font-medium">{done.condition}</span>. Isolate it in
          the hazard bin — do not load it with the rest.
          {queued
            ? " The event is queued offline and will sync from the Queue tab."
            : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setQueued(false);
            setSubmitted(null);
            setTag("");
          }}
          className="mt-4 h-12 w-full rounded-ctl bg-brand text-[14px] font-medium text-white"
        >
          Triage another unit
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-page-title mb-1">Triage</h1>
      <p className="mb-4 text-[13px] text-ink-secondary">
        Selecting a condition quarantines the unit immediately. This is one-way
        — release needs a control-tower review.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (tag.trim()) setSubmitted(tag.trim().toUpperCase());
        }}
      >
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="RVL-00000"
          aria-label="Unit tag"
          className="mono h-12 min-w-0 flex-1 rounded-ctl border border-line bg-card px-3 text-[15px] text-ink"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-ctl bg-brand px-4 text-[14px] font-medium text-white"
        >
          Look up
        </button>
      </form>

      {submitted ? (
        unit === undefined ? (
          <div className="skeleton mt-4 h-16" />
        ) : unit === null ? (
          <p className="mt-3 text-[13px] text-danger">
            No unit with tag <Mono>{submitted}</Mono>.
          </p>
        ) : (
          <div className="mt-4">
            <div className="flex items-center justify-between rounded-card border border-line bg-card p-3.5">
              <Mono className="font-medium">{unit.tag}</Mono>
              <span className="flex gap-1.5">
                <Badge tone={GRADE_TONE[unit.grade] ?? "neutral"}>
                  {GRADE_LABEL[unit.grade]}
                </Badge>
                <Badge tone="neutral">{STAGE_LABEL[unit.stage]}</Badge>
                {unit.quarantined ? (
                  <Badge tone="danger">Already quarantined</Badge>
                ) : null}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {CONDITIONS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  disabled={busy || unit.quarantined}
                  onClick={() => select(c.key, c.label)}
                  className="flex h-20 w-full items-center gap-4 rounded-card border border-danger/40 bg-card px-5 text-left transition-colors hover:bg-danger-bg disabled:opacity-50"
                >
                  <c.icon size={28} className="shrink-0 text-danger" aria-hidden />
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">
                      {c.label}
                    </span>
                    <span className="text-[12px] text-ink-secondary">
                      Quarantine immediately
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
