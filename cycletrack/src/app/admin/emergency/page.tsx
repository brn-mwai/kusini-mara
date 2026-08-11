"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Siren } from "@phosphor-icons/react";
import { SidePanel } from "@/app/components/side-panel";
import { Badge, Button, Mono } from "@/app/components/ui";
import { GRADE_LABEL, GRADE_TONE, STAGE_LABEL } from "@/lib/format";

// The emergency override: immediately quarantine a unit by tag, network-wide.
// Full-height danger panel, deliberately unlike every other surface.
export default function EmergencyOverride() {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const lookup = useQuery(
    api.trail.scanLookup,
    tag.trim() ? { tag: tag.trim().toUpperCase() } : "skip",
  );
  const quarantine = useMutation(api.batteries.quarantineBattery);

  const confirm = async () => {
    if (!lookup) {
      setError("Enter a valid unit tag first");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required — it is written to the unit's record");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await quarantine({ batteryId: lookup._id, reason: `Emergency override — ${reason.trim()}` });
      setDone(lookup.tag);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Override failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SidePanel
      open
      onClose={() => router.push("/admin")}
      tone="danger"
      title={
        <span className="flex items-center gap-2">
          <Siren size={18} aria-hidden />
          Emergency override
        </span>
      }
      subtitle="Immediately quarantines a unit across the network"
      footer={
        done === null ? (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              disabled={busy || !lookup}
              onClick={() => void confirm()}
            >
              {busy ? "Applying…" : "Quarantine immediately"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => router.push("/admin")}>
            Back to dashboard
          </Button>
        )
      }
    >
      {done !== null ? (
        <div className="rounded-ctl border border-danger/30 bg-card p-4">
          <div className="text-card-title text-danger">Unit quarantined</div>
          <p className="mt-1.5 text-[13px] leading-5 text-ink">
            <Mono className="font-medium">{done}</Mono> is now held. It has left
            the offtake pool and its public record shows the safety hold.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] leading-5 text-ink">
            Use this only for an active safety incident. The unit is pulled from
            every pool at once and a quarantine event is written to its record.
            Release later requires a per-unit review.
          </p>
          <label className="block text-[12px] font-medium text-ink-secondary">
            Unit tag
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="RVL-00000"
              className="mono mt-1 h-11 w-full rounded-ctl border border-line bg-card px-3 text-[15px] text-ink"
            />
          </label>
          {tag.trim() ? (
            lookup === undefined ? (
              <div className="skeleton h-14" />
            ) : lookup === null ? (
              <p className="text-[13px] text-danger">No unit with this tag.</p>
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-ctl border border-line bg-card p-3">
                <Mono className="font-medium">{lookup.tag}</Mono>
                <span className="flex items-center gap-1.5">
                  <Badge tone={GRADE_TONE[lookup.grade] ?? "neutral"}>
                    {GRADE_LABEL[lookup.grade]}
                  </Badge>
                  <Badge tone="neutral">{STAGE_LABEL[lookup.stage]}</Badge>
                  {lookup.quarantined ? (
                    <Badge tone="danger">Already quarantined</Badge>
                  ) : null}
                </span>
              </div>
            )
          ) : null}
          <label className="block text-[12px] font-medium text-ink-secondary">
            Reason (required)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-ctl border border-line bg-card p-2.5 text-[13px] text-ink"
            />
          </label>
          <div className="min-h-4 text-[12px] text-danger">{error ?? ""}</div>
        </div>
      )}
    </SidePanel>
  );
}
