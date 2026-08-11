"use client";

import { useState } from "react";
import { CloudSun, Recycle } from "@phosphor-icons/react";
import { PublicChrome } from "@/app/components/public-chrome";
import { Card, Mono } from "@/app/components/ui";
import { computeImpact } from "@/lib/impact";
import { formatKg } from "@/lib/format";

export default function ImpactPage() {
  const [weight, setWeight] = useState("5");
  const parsed = Number(weight);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const result = valid ? computeImpact(parsed) : null;

  return (
    <PublicChrome>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-page-title mb-1">Impact</h1>
        <p className="mb-5 text-[13px] text-ink-secondary">
          What returning used batteries avoids and recovers.
        </p>

        <Card>
          <label className="block text-[13px] font-medium text-ink">
            Weight of batteries returned
            <div className="mt-2 flex items-center gap-2">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
                aria-label="Weight in kilograms"
                className="mono h-11 w-32 rounded-ctl border border-line bg-card px-3 text-[16px] text-ink"
              />
              <span className="text-[14px] text-ink-secondary">kg</span>
            </div>
          </label>
          {!valid && weight.trim() !== "" ? (
            <p className="mt-1.5 text-[12px] text-danger">
              Enter a positive number of kilograms.
            </p>
          ) : null}
        </Card>

        {result ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-line bg-card p-5 shadow-sm">
              <div className="flex size-8 items-center justify-center rounded-ctl bg-brand-subtle text-brand">
                <CloudSun size={16} aria-hidden />
              </div>
              <div className="mt-3 text-[13px] text-ink-secondary">
                Avoided emissions
              </div>
              <div className="mono mt-0.5 text-[26px] font-bold text-ink">
                {formatKg(result.avoidedCo2eKg)}
              </div>
              <div className="text-[12px] text-ink-tertiary">
                CO₂-equivalent vs. virgin material production
              </div>
            </div>
            <div className="rounded-card border border-line bg-card p-5 shadow-sm">
              <div className="flex size-8 items-center justify-center rounded-ctl bg-brand-subtle text-brand">
                <Recycle size={16} aria-hidden />
              </div>
              <div className="mt-3 text-[13px] text-ink-secondary">
                Recoverable materials
              </div>
              <dl className="mt-2 space-y-1.5">
                {result.materials.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-baseline justify-between gap-2 text-[13px]"
                  >
                    <dt className="text-ink-secondary">{m.name}</dt>
                    <dd>
                      <Mono>{formatKg(m.kg)}</Mono>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : null}

        <p className="mt-5 rounded-card border border-line bg-raised p-4 text-[12px] leading-5 text-ink-secondary">
          <span className="font-semibold text-ink">Methodology.</span> These
          figures are indicative avoided-burden averages for a mixed portable
          lithium-ion stream, intended to communicate scale. They are not a
          certified carbon footprint, and actual recovery varies by chemistry
          mix and process.
        </p>
      </div>
    </PublicChrome>
  );
}
