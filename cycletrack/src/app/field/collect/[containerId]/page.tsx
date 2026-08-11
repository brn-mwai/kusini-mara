"use client";

import { use, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CheckCircle, Thermometer, XCircle } from "@phosphor-icons/react";
import { Badge, Button, Mono, Skeleton } from "@/app/components/ui";
import { enqueue } from "@/lib/field-queue";
import { formatKg, formatPct } from "@/lib/format";

const STEPS = ["Scan", "Temp", "Weigh", "Sign", "Confirm"] as const;

async function hashDataUrl(dataUrl: string): Promise<string> {
  const bytes = new TextEncoder().encode(dataUrl);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function SignatureCanvas({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={480}
        height={192}
        aria-label="Signature pad"
        className="h-48 w-full touch-none rounded-ctl border border-line bg-card"
        onPointerDown={(e) => {
          drawing.current = true;
          const ctx = canvasRef.current!.getContext("2d")!;
          const p = pos(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvasRef.current!.getContext("2d")!;
          const styles = getComputedStyle(document.documentElement);
          ctx.strokeStyle = styles.getPropertyValue("--text").trim();
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          const p = pos(e);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          if (!drawing.current) return;
          drawing.current = false;
          setHasInk(true);
          onChange(canvasRef.current!.toDataURL("image/png"));
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[12px] text-ink-tertiary">
          Sign with a finger or stylus
        </span>
        {hasInk ? (
          <button
            type="button"
            className="text-[12px] font-medium text-ink-secondary underline"
            onClick={() => {
              const ctx = canvasRef.current!.getContext("2d")!;
              ctx.clearRect(0, 0, 480, 192);
              setHasInk(false);
              onChange(null);
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function CollectWizard({
  params,
}: {
  params: Promise<{ containerId: string }>;
}) {
  const { containerId } = use(params);
  const stops = useQuery(api.collections.todayStops, {});
  const complete = useMutation(api.collections.completeCollection);
  const refuse = useMutation(api.collections.refuseCollection);

  const stop = useMemo(
    () => stops?.find((s) => s.containerId === containerId) ?? null,
    [stops, containerId],
  );

  const [step, setStep] = useState(0);
  const [scanInput, setScanInput] = useState("");
  const [mass, setMass] = useState("");
  const [count, setCount] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<null | "collected" | "refused" | "queued">(
    null,
  );
  const [refusing, setRefusing] = useState(false);
  const [refuseReason, setRefuseReason] = useState("Container above temperature threshold");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (stops === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="rounded-card border border-line bg-card p-5 text-[13px] text-ink-secondary">
        No collection is scheduled today for this container.{" "}
        <Link href="/field" className="font-medium text-brand underline">
          Back to today&apos;s stops
        </Link>
      </div>
    );
  }

  if (stop.status === "collected" && outcome === null) {
    return (
      <DoneCard
        tone="success"
        title="Already collected"
        body={`${stop.container} at ${stop.site} was collected earlier today.`}
      />
    );
  }

  if (outcome === "collected") {
    return (
      <DoneCard
        tone="success"
        title="Collection complete"
        body={`${stop.container} signed off — custody transferred with weight and count on record.`}
      />
    );
  }
  if (outcome === "refused") {
    return (
      <DoneCard
        tone="danger"
        title="Container refused"
        body="The refusal and its reason are on the container's record. Do not load it."
      />
    );
  }
  if (outcome === "queued") {
    return (
      <DoneCard
        tone="warning"
        title="Saved offline"
        body="No connection — the collection is queued and will sync from the Queue tab."
      />
    );
  }

  const scanOk = scanInput.trim().toUpperCase() === stop.container.toUpperCase();
  const massNum = Number(mass);
  const countNum = Number(count);
  const weighOk =
    Number.isFinite(massNum) &&
    massNum > 0 &&
    Number.isInteger(countNum) &&
    countNum > 0;

  const finish = async () => {
    if (!signature) return;
    setBusy(true);
    setError(null);
    const payload = {
      collectionId: stop._id,
      massKg: massNum,
      unitCount: countNum,
      tempOk: true,
      signatureHash: await hashDataUrl(signature),
    };
    try {
      await complete(payload);
      setOutcome("collected");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed";
      // Validation errors surface; connectivity failures queue for later.
      if (/fetch|network|websocket|connect/i.test(message)) {
        enqueue("completeCollection", `Collection · ${stop.container}`, payload, message);
        setOutcome("queued");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const doRefuse = async () => {
    setBusy(true);
    setError(null);
    const payload = { collectionId: stop._id, reason: refuseReason };
    try {
      await refuse(payload);
      setOutcome("refused");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed";
      if (/fetch|network|websocket|connect/i.test(message)) {
        enqueue("refuseCollection", `Refusal · ${stop.container}`, payload, message);
        setOutcome("queued");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-page-title mb-1">
        Collect <Mono className="text-[18px]">{stop.container}</Mono>
      </h1>
      <p className="mb-4 text-[13px] text-ink-secondary">{stop.site}</p>

      {/* progress indicator */}
      <ol className="mb-5 flex items-center gap-1" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`h-1.5 w-full rounded-full ${
                i < step ? "bg-success" : i === step ? "bg-brand" : "bg-raised"
              }`}
              aria-hidden
            />
            <span
              className={`text-[10px] font-medium ${
                i === step ? "text-brand" : "text-ink-tertiary"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <div className="rounded-card border border-line bg-card p-4 shadow-sm">
        {step === 0 ? (
          <div>
            <h2 className="text-card-title">Scan the container</h2>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Type or scan the container tag to confirm you are at the right
              unit. Expected: <Mono>{stop.container}</Mono>
            </p>
            <input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="CTR-000"
              aria-label="Container tag"
              className="mono mt-3 h-12 w-full rounded-ctl border border-line bg-card px-3 text-[15px] text-ink"
            />
            {scanInput.trim() !== "" && !scanOk ? (
              <p className="mt-1.5 text-[12px] text-danger">
                That is not the expected container for this stop.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!scanOk}
              onClick={() => setStep(1)}
              className="mt-4 h-12 w-full rounded-ctl bg-brand text-[14px] font-medium text-white disabled:opacity-50"
            >
              Container confirmed
            </button>
          </div>
        ) : step === 1 ? (
          <div>
            <h2 className="text-card-title">Temperature check</h2>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Check the container thermometer strip. Refuse anything above the
              threshold or showing heat damage.
            </p>
            {refusing ? (
              <div className="mt-3">
                <label className="block text-[12px] font-medium text-ink-secondary">
                  Refusal reason
                  <input
                    value={refuseReason}
                    onChange={(e) => setRefuseReason(e.target.value)}
                    className="mt-1 h-11 w-full rounded-ctl border border-line bg-card px-3 text-[13px] text-ink"
                  />
                </label>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy || refuseReason.trim() === ""}
                    onClick={() => void doRefuse()}
                    className="h-12 flex-1 rounded-ctl bg-danger text-[14px] font-medium text-white disabled:opacity-50"
                  >
                    {busy ? "Recording…" : "Confirm refusal"}
                  </button>
                  <Button
                    variant="secondary"
                    className="h-12 flex-1 justify-center"
                    onClick={() => setRefusing(false)}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex h-20 flex-col items-center justify-center gap-1 rounded-ctl border border-success/40 bg-success-bg text-success"
                >
                  <CheckCircle size={24} aria-hidden />
                  <span className="text-[14px] font-semibold">Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRefusing(true)}
                  className="flex h-20 flex-col items-center justify-center gap-1 rounded-ctl border border-danger/40 bg-danger-bg text-danger"
                >
                  <XCircle size={24} aria-hidden />
                  <span className="text-[14px] font-semibold">Refuse</span>
                </button>
              </div>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-tertiary">
              <Thermometer size={14} aria-hidden />
              Expected fill {formatPct(stop.expectedFillPct, { of100: true })}
            </p>
          </div>
        ) : step === 2 ? (
          <div>
            <h2 className="text-card-title">Weigh and count</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-[12px] font-medium text-ink-secondary">
                Weight (kg)
                <input
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  inputMode="decimal"
                  className="mono mt-1 h-12 w-full rounded-ctl border border-line bg-card px-3 text-[15px] text-ink"
                />
              </label>
              <label className="block text-[12px] font-medium text-ink-secondary">
                Unit count
                <input
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  inputMode="numeric"
                  className="mono mt-1 h-12 w-full rounded-ctl border border-line bg-card px-3 text-[15px] text-ink"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!weighOk}
              onClick={() => setStep(3)}
              className="mt-4 h-12 w-full rounded-ctl bg-brand text-[14px] font-medium text-white disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : step === 3 ? (
          <div>
            <h2 className="text-card-title">Site signature</h2>
            <p className="mb-3 mt-1 text-[13px] text-ink-secondary">
              The site contact signs to release the container.
            </p>
            <SignatureCanvas onChange={setSignature} />
            <button
              type="button"
              disabled={!signature}
              onClick={() => setStep(4)}
              className="mt-4 h-12 w-full rounded-ctl bg-brand text-[14px] font-medium text-white disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-card-title">Confirm collection</h2>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Container</dt>
                <dd>
                  <Mono>{stop.container}</Mono>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Site</dt>
                <dd>{stop.site}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Temperature</dt>
                <dd>
                  <Badge tone="success">Pass</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Weight</dt>
                <dd>
                  <Mono>{formatKg(massNum)}</Mono>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Units</dt>
                <dd>
                  <Mono>{count}</Mono>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Signature</dt>
                <dd>
                  <Badge tone="success">Captured</Badge>
                </dd>
              </div>
            </dl>
            <div className="mt-1 min-h-4 text-[12px] text-danger">
              {error ?? ""}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void finish()}
              className="mt-3 h-12 w-full rounded-ctl bg-brand text-[14px] font-medium text-white disabled:opacity-50"
            >
              {busy ? "Recording…" : "Confirm and take custody"}
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-2 h-12 w-full rounded-ctl border border-line bg-card text-[14px] font-medium text-ink"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DoneCard({
  tone,
  title,
  body,
}: {
  tone: "success" | "danger" | "warning";
  title: string;
  body: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-success/40 bg-success-bg"
      : tone === "danger"
        ? "border-danger/40 bg-danger-bg"
        : "border-warning/40 bg-warning-bg";
  return (
    <div className={`rounded-card border p-5 ${toneClass}`}>
      <div className="text-card-title">{title}</div>
      <p className="mt-1 text-[13px] leading-5 text-ink-secondary">{body}</p>
      <Link
        href="/field"
        className="mt-4 flex h-12 items-center justify-center rounded-ctl bg-brand text-[14px] font-medium text-white"
      >
        Back to today&apos;s stops
      </Link>
    </div>
  );
}
