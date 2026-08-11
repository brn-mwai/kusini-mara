"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  BatteryHigh,
  HandCoins,
  Lightning,
  Recycle,
  Scales,
} from "@phosphor-icons/react";
import { KpiCard, KpiRow } from "@/app/components/kpi";
import { StatBar } from "@/app/components/statbar";
import { Badge, Button, Card, Mono, PageHeader, Skeleton } from "@/app/components/ui";
import { EmptyState } from "@/app/components/ui";
import {
  CHEMISTRY_LABEL,
  formatKg,
  formatKwh,
  formatNumber,
  formatTimeAgo,
} from "@/lib/format";

export default function PartnersDashboard() {
  const summary = useQuery(api.batteries.offtakeSummary, {});
  const interests = useQuery(api.interests.myInterests, {});
  const withdraw = useMutation(api.interests.withdraw);

  const chemistrySegments = summary
    ? Object.entries(summary.chemistryMixKg)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({
          label: CHEMISTRY_LABEL[k] ?? k,
          value: Math.round(v * 10) / 10,
        }))
    : [];

  const openInterests = interests?.filter((i) => i.status === "open");

  return (
    <div>
      <PageHeader
        title="Partner overview"
        subtitle="Stock available for offtake, by grade and chemistry"
      />
      <KpiRow>
        <KpiCard
          icon={BatteryHigh}
          label="Units available"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.unitsAvailable)
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
          icon={HandCoins}
          label="For material recovery"
          value={
            summary === undefined
              ? undefined
              : formatNumber(summary.forMaterialRecovery)
          }
        />
        <KpiCard
          icon={Scales}
          label="Total mass"
          value={
            summary === undefined ? undefined : formatKg(summary.totalMassKg)
          }
        />
        <KpiCard
          icon={Lightning}
          label="Second-life capacity"
          value={
            summary === undefined ? undefined : formatKwh(summary.secondLifeKwh)
          }
        />
      </KpiRow>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Chemistry mix by mass" className="lg:col-span-2">
          {summary === undefined ? (
            <Skeleton className="h-24" />
          ) : chemistrySegments.length === 0 ? (
            <p className="text-[13px] text-ink-secondary">
              No stock currently available.
            </p>
          ) : (
            <StatBar segments={chemistrySegments} formatValue={formatKg} />
          )}
        </Card>

        <Card title="Open interests" padded={false}>
          {openInterests === undefined ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : openInterests.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={HandCoins}
                title="No open interests"
                body="Express interest on stock to start an offtake conversation."
              />
            </div>
          ) : (
            <ul>
              {openInterests.map((i) => (
                <li
                  key={i._id}
                  className="flex items-center justify-between gap-2 border-b border-line-light px-5 py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <Mono className="font-medium">{i.tag}</Mono>
                    <div className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-secondary">
                      {i.chemistry ? (
                        <Mono className="text-[12px]">
                          {CHEMISTRY_LABEL[i.chemistry]}
                        </Mono>
                      ) : null}
                      {i.massKg !== null ? (
                        <Mono className="text-[12px]">{formatKg(i.massKg)}</Mono>
                      ) : null}
                      <span>{formatTimeAgo(i.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">open</Badge>
                    <Button
                      variant="ghost"
                      onClick={() => void withdraw({ interestId: i._id })}
                    >
                      Withdraw
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
