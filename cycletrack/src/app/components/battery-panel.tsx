"use client";

import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  ArrowSquareOut,
  ShieldWarning,
  Sparkle,
} from "@phosphor-icons/react";
import { SidePanel } from "./side-panel";
import { Timeline } from "./timeline";
import { Badge, Button, Mono, Skeleton } from "./ui";
import {
  EVENT_LABEL,
  formatDate,
  formatKg,
  formatKwh,
  formatNumber,
  GRADE_LABEL,
  GRADE_TONE,
  STAGE_LABEL,
  STAGE_TONE,
  truncateHash,
} from "@/lib/format";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
        {label}
      </div>
      <div className="mt-0.5 text-[13px] text-ink">{children}</div>
    </div>
  );
}

type StaffAction = null | "grade" | "quarantine" | "release";

export function BatteryDetailPanel({
  batteryId,
  mode,
  onClose,
}: {
  batteryId: Id<"batteries"> | null;
  mode: "staff" | "producer";
  onClose: () => void;
}) {
  const trail = useQuery(
    mode === "staff" ? api.trail.trailForStaff : api.batteries.batteryTrail,
    batteryId ? { batteryId } : "skip",
  );
  const gradeBattery = useMutation(api.batteries.gradeBattery);
  const quarantineBattery = useMutation(api.batteries.quarantineBattery);
  const releaseBattery = useMutation(api.batteries.releaseBattery);

  const [action, setAction] = useState<StaffAction>(null);
  const [grade, setGrade] = useState("reusable");
  const [soh, setSoh] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setAction(null);
    setError(null);
    setNote("");
    setSoh("");
    onClose();
  };

  const runAction = async () => {
    if (!batteryId || !action) return;
    setBusy(true);
    setError(null);
    try {
      if (action === "grade") {
        await gradeBattery({
          batteryId,
          grade: grade as "reusable" | "repairable" | "recycle" | "hazardous",
          stateOfHealthPct: soh ? Number(soh) : undefined,
          note: note || undefined,
        });
      } else if (action === "quarantine") {
        if (!note.trim()) {
          setError("A reason is required to quarantine");
          setBusy(false);
          return;
        }
        await quarantineBattery({ batteryId, reason: note.trim() });
      } else {
        await releaseBattery({ batteryId, note: note || undefined });
      }
      setAction(null);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const b = trail?.battery;

  return (
    <SidePanel
      open={batteryId !== null}
      onClose={close}
      title={
        b ? (
          <span className="flex items-center gap-2">
            <Mono className="text-[14px] font-medium">{b.tag}</Mono>
            <Badge tone={GRADE_TONE[b.grade] ?? "neutral"}>
              {GRADE_LABEL[b.grade]}
            </Badge>
            <Badge tone={STAGE_TONE[b.stage] ?? "neutral"}>
              {STAGE_LABEL[b.stage]}
            </Badge>
          </span>
        ) : (
          "Battery"
        )
      }
      subtitle={b ? `Producer · ${b.producer}` : undefined}
      footer={
        mode === "staff" && b ? (
          action === null ? (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                icon={Sparkle}
                disabled={b.quarantined}
                onClick={() => setAction("grade")}
              >
                Grade
              </Button>
              {b.quarantined ? (
                <Button variant="secondary" onClick={() => setAction("release")}>
                  Release
                </Button>
              ) : (
                <Button
                  variant="danger"
                  icon={ShieldWarning}
                  onClick={() => setAction("quarantine")}
                >
                  Quarantine
                </Button>
              )}
            </div>
          ) : (
            <div>
              {action === "grade" ? (
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <label className="block text-[12px] font-medium text-ink-secondary">
                    Grade
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
                    >
                      <option value="reusable">Reusable</option>
                      <option value="repairable">Repairable</option>
                      <option value="recycle">Recycle</option>
                      <option value="hazardous">Hazardous</option>
                    </select>
                  </label>
                  <label className="block text-[12px] font-medium text-ink-secondary">
                    State of health %
                    <input
                      value={soh}
                      onChange={(e) => setSoh(e.target.value)}
                      inputMode="numeric"
                      placeholder="—"
                      className="mono mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
                    />
                  </label>
                </div>
              ) : null}
              <label className="block text-[12px] font-medium text-ink-secondary">
                {action === "quarantine" ? "Reason (required)" : "Note"}
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
                />
              </label>
              <div className="mt-1 min-h-4 text-[12px] text-danger">
                {error ?? ""}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant={action === "quarantine" ? "danger" : "primary"}
                  disabled={busy}
                  onClick={() => void runAction()}
                >
                  {busy
                    ? "Working…"
                    : action === "grade"
                      ? "Confirm grade"
                      : action === "quarantine"
                        ? "Confirm quarantine"
                        : "Confirm release"}
                </Button>
                <Button variant="ghost" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )
        ) : undefined
      }
    >
      {trail === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : trail === null ? (
        <p className="text-[13px] text-ink-secondary">
          This unit is not visible to your workspace.
        </p>
      ) : (
        <div className="space-y-5">
          {trail.battery.quarantined ? (
            <div className="flex items-start gap-2.5 rounded-ctl border border-danger/30 bg-danger-bg p-3">
              <ShieldWarning size={16} className="mt-0.5 text-danger" aria-hidden />
              <div className="text-[13px] text-ink">
                <span className="font-semibold text-danger">Quarantined.</span>{" "}
                {trail.battery.quarantineReason ?? "Held for safety review."}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Chemistry">
              <Mono>{trail.battery.chemistry.replace("_", "-")}</Mono>
            </Field>
            <Field label="Mass">
              <Mono>{formatKg(trail.battery.massKg)}</Mono>
            </Field>
            <Field label="Capacity">
              {trail.battery.capacityKwh !== null ? (
                <Mono>{formatKwh(trail.battery.capacityKwh)}</Mono>
              ) : (
                <span className="text-ink-tertiary">—</span>
              )}
            </Field>
            <Field label="State of health">
              {trail.battery.stateOfHealthPct !== null ? (
                <Mono>{trail.battery.stateOfHealthPct}%</Mono>
              ) : (
                <span className="text-ink-tertiary">Not graded</span>
              )}
            </Field>
            <Field label="Cycle count">
              {trail.battery.cycleCount !== null ? (
                <Mono>{formatNumber(trail.battery.cycleCount)}</Mono>
              ) : (
                <span className="text-ink-tertiary">—</span>
              )}
            </Field>
            <Field label="Public record">
              <a
                href={`/q/${trail.battery.publicToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                <Mono className="text-brand">/q/{trail.battery.publicToken}</Mono>
                <ArrowSquareOut size={12} aria-hidden />
              </a>
            </Field>
          </div>

          {trail.battery.dismantlingNotes ? (
            <Field label="Dismantling notes">
              {trail.battery.dismantlingNotes}
            </Field>
          ) : null}

          <div>
            <h3 className="text-card-title mb-3">Movement history</h3>
            <Timeline
              entries={trail.events.map((e, i) => ({
                key: `${e.hash}-${i}`,
                title: `${EVENT_LABEL[e.type] ?? e.type}${e.actor ? ` · ${e.actor}` : ""}`,
                at: e.at,
                tone:
                  e.type === "quarantine" || e.type === "triage"
                    ? "danger"
                    : e.type === "grade" || e.type === "disposition"
                      ? "success"
                      : "default",
                note: (
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {e.note ? <span>{e.note}</span> : null}
                    {e.massKg !== null ? (
                      <Mono className="text-[12px]">{formatKg(e.massKg)}</Mono>
                    ) : null}
                    <Mono
                      className="text-[11px] text-ink-tertiary"
                      title={e.hash}
                    >
                      {truncateHash(e.hash)}
                    </Mono>
                  </span>
                ),
              }))}
            />
          </div>

          <div className="rounded-ctl border border-line bg-page p-3.5">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
              Anchor receipt
            </div>
            {trail.anchor ? (
              <div className="mt-2 space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">Merkle root</span>
                  <Mono title={trail.anchor.merkleRoot}>
                    {truncateHash(trail.anchor.merkleRoot, 16)}
                  </Mono>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">Provider</span>
                  <span>{trail.anchor.provider}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">Period</span>
                  <Mono>
                    {formatDate(trail.anchor.periodStart)} –{" "}
                    {formatDate(trail.anchor.periodEnd)}
                  </Mono>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink-secondary">State</span>
                  <Badge
                    tone={trail.anchor.state === "confirmed" ? "success" : "warning"}
                  >
                    {trail.anchor.state}
                  </Badge>
                </div>
                {trail.anchor.txId ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-ink-secondary">Transaction</span>
                    <Mono title={trail.anchor.txId}>
                      {truncateHash(trail.anchor.txId, 14)}
                    </Mono>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-1.5 text-[13px] text-ink-secondary">
                Not yet included in an anchored period.
              </p>
            )}
          </div>
        </div>
      )}
    </SidePanel>
  );
}
