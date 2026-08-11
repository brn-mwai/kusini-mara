"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  BatteryHigh,
  HourglassMedium,
  Package,
  Recycle,
  Scales,
} from "@phosphor-icons/react";
import { KpiCard, KpiRow } from "@/app/components/kpi";
import { Chart, donutOption, lineAreaOption } from "@/app/components/chart";
import { Card, PageHeader } from "@/app/components/ui";
import { MovementsTable } from "@/app/components/movements-table";
import {
  formatDateShort,
  formatKg,
  formatNumber,
  GRADE_LABEL,
} from "@/lib/format";

export default function OemDashboard() {
  const summary = useQuery(api.batteries.producerSummary, {});
  const movements = useQuery(api.trail.myMovements, { limit: 8 });

  return (
    <div>
      <PageHeader
        title="Producer overview"
        subtitle="Your units across registration, collection and grading"
      />
      <KpiRow>
        <KpiCard
          icon={BatteryHigh}
          label="Batteries handed over"
          value={
            summary === undefined ? undefined : formatNumber(summary.handedOver)
          }
        />
        <KpiCard
          icon={Scales}
          label="Mass diverted"
          value={
            summary === undefined ? undefined : formatKg(summary.massDivertedKg)
          }
          sparkline={summary?.massOverTime.map((d) => d.cumulativeKg)}
        />
        <KpiCard
          icon={Package}
          label="Containers on site"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.containersOnSite)
          }
        />
        <KpiCard
          icon={Recycle}
          label="Graded reusable"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.gradedReusable)
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
      </KpiRow>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card
          title="Mass in custody over time · last 30 days"
          className="lg:col-span-2"
        >
          {summary === undefined ? (
            <div className="skeleton h-60" />
          ) : (
            <Chart
              ariaLabel="Line chart of cumulative mass handed over"
              height={240}
              option={lineAreaOption(
                summary.massOverTime.map((d) => formatDateShort(d.day)),
                summary.massOverTime.map(
                  (d) => Math.round(d.cumulativeKg * 10) / 10,
                ),
                "Cumulative kg",
              )}
            />
          )}
        </Card>
        <Card title="Condition split">
          {summary === undefined ? (
            <div className="skeleton h-60" />
          ) : (
            <Chart
              ariaLabel="Donut chart of condition split for your units"
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

      <div className="mt-5">
        <h2 className="text-card-title mb-3">Recent movements</h2>
        <MovementsTable rows={movements} />
      </div>
    </div>
  );
}
