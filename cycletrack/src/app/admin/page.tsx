"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  BatteryHigh,
  HourglassMedium,
  Package,
  Scales,
  ShieldWarning,
} from "@phosphor-icons/react";
import { KpiCard, KpiRow } from "@/app/components/kpi";
import { barOption, Chart, donutOption } from "@/app/components/chart";
import { Card, Mono } from "@/app/components/ui";
import { MovementsTable } from "@/app/components/movements-table";
import { PageHeader } from "@/app/components/ui";
import {
  formatDateShort,
  formatKes,
  formatKg,
  formatNumber,
  formatPct,
  GRADE_LABEL,
} from "@/lib/format";

export default function AdminDashboard() {
  const summary = useQuery(api.batteries.registrySummary, {});
  const movements = useQuery(api.trail.movements, { limit: 8 });

  const pilot = summary?.pilot;

  return (
    <div>
      <PageHeader
        title="Control tower"
        subtitle="Network-wide custody, grading and collection activity"
      />
      <KpiRow>
        <KpiCard
          icon={BatteryHigh}
          label="Batteries on the registry"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.totalOnRegistry)
          }
        />
        <KpiCard
          icon={Scales}
          label="Mass in custody"
          value={
            summary === undefined
              ? undefined
              : formatKg(summary.massInCustodyKg)
          }
        />
        <KpiCard
          icon={Package}
          label="Containers deployed"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.containersDeployed)
          }
        />
        <KpiCard
          icon={HourglassMedium}
          label="Awaiting grading"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.awaitingGrading)
          }
        />
        <KpiCard
          icon={ShieldWarning}
          label="Quarantined"
          value={
            summary === undefined ? undefined : formatNumber(summary.quarantined)
          }
        />
      </KpiRow>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Collections per day · last 14 days" className="lg:col-span-2">
          {summary === undefined ? (
            <div className="skeleton h-60" />
          ) : (
            <Chart
              ariaLabel="Bar chart of collections per day over the last 14 days"
              height={240}
              option={barOption(
                summary.collectionsPerDay.map((d) => formatDateShort(d.day)),
                summary.collectionsPerDay.map((d) => d.count),
                "Collections",
              )}
            />
          )}
        </Card>
        <Card title="Condition split">
          {summary === undefined ? (
            <div className="skeleton h-60" />
          ) : (
            <Chart
              ariaLabel="Donut chart of unit condition split"
              height={240}
              option={donutOption(
                Object.entries(summary.conditionSplit).map(([k, v]) => ({
                  name: GRADE_LABEL[k] ?? k,
                  value: v,
                })),
                "units",
              )}
            />
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-card-title mb-3">Recent movements</h2>
          <MovementsTable rows={movements} />
        </div>
        <Card title="Pilot numbers">
          <dl className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-ink-secondary">
                Kilograms per point per month
              </dt>
              <dd>
                {pilot === undefined ? (
                  <span className="skeleton inline-block h-5 w-16" />
                ) : pilot.kgPerPointPerMonth === null ? (
                  <span className="text-ink-tertiary">—</span>
                ) : (
                  <Mono className="text-[15px] font-medium">
                    {formatKg(pilot.kgPerPointPerMonth)}
                  </Mono>
                )}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-ink-secondary">
                Servicing cost per point
              </dt>
              <dd>
                {pilot === undefined ? (
                  <span className="skeleton inline-block h-5 w-16" />
                ) : pilot.servicingCostPerPointKes === null ? (
                  <span className="text-ink-tertiary">—</span>
                ) : (
                  <Mono className="text-[15px] font-medium">
                    {formatKes(pilot.servicingCostPerPointKes)}
                  </Mono>
                )}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] text-ink-secondary">
                Contamination rate
              </dt>
              <dd>
                {pilot === undefined ? (
                  <span className="skeleton inline-block h-5 w-16" />
                ) : pilot.contaminationRate === null ? (
                  <span className="text-ink-tertiary">—</span>
                ) : (
                  <Mono className="text-[15px] font-medium">
                    {formatPct(pilot.contaminationRate)}
                  </Mono>
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-line-light pt-3 text-[12px] leading-4 text-ink-tertiary">
            Trailing 30 days across active collection points.
          </p>
        </Card>
      </div>
    </div>
  );
}
