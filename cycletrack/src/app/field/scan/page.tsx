"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Barcode } from "@phosphor-icons/react";
import { Badge, Mono } from "@/app/components/ui";
import { SwipeToConfirm } from "@/app/components/swipe-confirm";
import { enqueue } from "@/lib/field-queue";
import {
  CHEMISTRY_LABEL,
  formatKg,
  formatTimeAgo,
  GRADE_LABEL,
  GRADE_TONE,
  STAGE_LABEL,
} from "@/lib/format";

export default function FieldScan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<"starting" | "on" | "denied">(
    "starting",
  );
  const [tag, setTag] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [queued, setQueued] = useState(false);

  const unit = useQuery(
    api.trail.scanLookup,
    submitted ? { tag: submitted } : "skip",
  );
  const signForCustody = useMutation(api.trail.signForCustody);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
      : Promise.reject(new Error("camera unsupported"));
    request
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
        setCameraState("on");
      })
      .catch(() => {
        if (!cancelled) setCameraState("denied");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const confirm = () => {
    if (!unit) return;
    setSigned(true);
    signForCustody({ batteryId: unit._id }).catch((e) => {
      enqueue(
        "signForCustody",
        `Sign for custody · ${unit.tag}`,
        { batteryId: unit._id },
        e instanceof Error ? e.message : "Failed",
      );
      setQueued(true);
    });
  };

  const reset = () => {
    setSubmitted(null);
    setTag("");
    setSigned(false);
    setQueued(false);
  };

  return (
    <div className="fixed inset-0 bottom-14 z-10 bg-navy">
      {/* viewfinder */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 size-full object-cover"
        aria-label="Camera viewfinder"
      />
      {cameraState !== "on" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <Barcode size={40} className="text-white/70" aria-hidden />
          <p className="text-[13px] text-white/80">
            {cameraState === "starting"
              ? "Starting camera…"
              : "Camera unavailable — type the unit tag below instead."}
          </p>
        </div>
      ) : null}

      {/* framing reticle */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-44 w-72">
          {(["-top-0 -left-0", "-top-0 -right-0", "-bottom-0 -left-0", "-bottom-0 -right-0"] as const).map(
            (pos) => (
              <span
                key={pos}
                className={`absolute size-8 ${pos.includes("top") ? "border-t-[3px]" : "border-b-[3px]"} ${
                  pos.includes("left") ? "border-l-[3px] left-0" : "border-r-[3px] right-0"
                } ${pos.includes("top") ? "top-0" : "bottom-0"} rounded-sm border-white/90`}
              />
            ),
          )}
        </div>
      </div>

      {/* manual tag entry */}
      <form
        className="absolute inset-x-4 top-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (tag.trim()) {
            setSubmitted(tag.trim().toUpperCase());
            setSigned(false);
            setQueued(false);
          }
        }}
      >
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="RVL-00000"
          aria-label="Unit tag"
          className="mono h-12 min-w-0 flex-1 rounded-ctl border border-white/20 bg-navy/70 px-3 text-[15px] text-white placeholder:text-white/40 backdrop-blur"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-ctl bg-brand px-4 text-[14px] font-medium text-white"
        >
          Look up
        </button>
      </form>

      {/* bottom sheet */}
      {submitted ? (
        <div className="sheet-enter absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-card p-4 pb-6 shadow-md">
          {unit === undefined ? (
            <div className="space-y-3">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-16 w-full" />
            </div>
          ) : unit === null ? (
            <div>
              <div className="text-card-title">No unit found</div>
              <p className="mt-1 text-[13px] text-ink-secondary">
                <Mono>{submitted}</Mono> is not on the registry. Check the tag
                and try again.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-3 h-12 w-full rounded-ctl border border-line bg-card text-[14px] font-medium text-ink"
              >
                Scan another
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2">
                <Mono className="text-[16px] font-medium">{unit.tag}</Mono>
                <span className="flex gap-1.5">
                  <Badge tone={GRADE_TONE[unit.grade] ?? "neutral"}>
                    {GRADE_LABEL[unit.grade]}
                  </Badge>
                  {unit.quarantined ? <Badge tone="danger">Quarantined</Badge> : null}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div className="rounded-ctl bg-raised p-2">
                  <dt className="text-ink-tertiary">Last state</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {STAGE_LABEL[unit.stage]}
                  </dd>
                </div>
                <div className="rounded-ctl bg-raised p-2">
                  <dt className="text-ink-tertiary">Expected weight</dt>
                  <dd className="mono mt-0.5 text-[13px] font-medium">
                    {formatKg(unit.expectedMassKg)}
                  </dd>
                </div>
                <div className="rounded-ctl bg-raised p-2">
                  <dt className="text-ink-tertiary">Chemistry</dt>
                  <dd className="mono mt-0.5 text-[13px] font-medium">
                    {CHEMISTRY_LABEL[unit.chemistry]}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-[12px] text-ink-tertiary">
                {unit.custodian ? `With ${unit.custodian} · ` : ""}
                last movement {formatTimeAgo(unit.lastEventAt)}
              </p>
              <div className="mt-4">
                {queued ? (
                  <div className="rounded-ctl border border-warning/40 bg-warning-bg p-3 text-[13px] text-ink">
                    Offline — the custody signature is queued and will sync from
                    the Queue tab.
                  </div>
                ) : (
                  <SwipeToConfirm
                    label="Sign for custody"
                    onConfirm={confirm}
                    disabled={signed || unit.custodian === "Revlog Operations"}
                  />
                )}
              </div>
              {signed && !queued ? (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 h-12 w-full rounded-ctl border border-line bg-card text-[14px] font-medium text-ink"
                >
                  Scan another
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
