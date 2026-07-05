import { useState } from "react";
import { useQuery } from "convex/react";
import { IconChartBar } from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { KpiCards, type Kpi } from "@/components/kpi/KpiCards";
import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { PageTabs, type PageTab } from "@/components/tabs/PageTabs";

import pageStyles from "@/components/pageStyles.module.scss";
import styles from "./ReportsPage.module.scss";

const TABS: PageTab[] = [
  { id: "coordination", label: "Coordination" },
  { id: "duties", label: "Duties" },
];

export const ReportsPage = () => {
  const data = useQuery(api.reports.summary);
  const [tabId, setTabId] = useState("coordination");

  if (data === undefined) return <PageLoading label="Loading reports…" />;
  if (data === null) return <PageUnseeded />;

  const kpis: Kpi[] = [
    {
      label: "Missed arrivals",
      value: data.kpis.missedArrivals,
      tone: data.kpis.missedArrivals > 0 ? "danger" : "success",
    },
    { label: "Acked ≥2h before ETA", value: `${data.kpis.ackedTwoHoursPlusPct}%` },
    {
      label: "Escalations",
      value: data.kpis.escalations,
      tone: data.kpis.escalations > 0 ? "danger" : "default",
    },
    { label: "On-platform", value: `${data.kpis.onPlatformPct}%`, tone: "success" },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader Icon={IconChartBar} title="Reports" />
      <KpiCards kpis={kpis} />
      <PageTabs tabs={TABS} activeId={tabId} onChange={setTabId} />
      <div className={styles.scroll}>
        {tabId === "coordination" && (
          <div className={styles.card}>
            <H2Title title="Coordination" description="The pilot's grading metrics" />
            <div className={styles.stats}>
              <Stat label="Movements" value={data.coordination.totalMovements} />
              <Stat label="Acknowledged" value={data.coordination.acknowledged} />
              <Stat
                label="Avg ack lead"
                value={
                  data.coordination.avgAckLeadHours === null
                    ? "—"
                    : `${data.coordination.avgAckLeadHours}h before ETA`
                }
              />
            </div>
            <div className={styles.breakdown}>
              <span className={pageStyles.muted}>By mode:</span>
              {data.coordination.byMode.map((m: { mode: string; count: number }) => (
                <Tag key={m.mode} color="blue" text={`${m.mode.replace(/_/g, " ")} · ${m.count}`} />
              ))}
            </div>
            <div className={styles.breakdown}>
              <span className={pageStyles.muted}>By carrier:</span>
              {data.coordination.byCarrier.map((c: { carrier: string; count: number }) => (
                <Tag key={c.carrier} color="gray" text={`${c.carrier} · ${c.count}`} />
              ))}
              {data.coordination.byCarrier.length === 0 && (
                <span className={pageStyles.muted}>none yet</span>
              )}
            </div>
          </div>
        )}
        {tabId === "duties" && (
          <div className={styles.card}>
            <H2Title title="Duties" description="Ground-job confirmation" />
            <div className={styles.stats}>
              <Stat label="Ground jobs" value={data.duties.total} />
              <Stat label="Confirmed" value={data.duties.confirmed} />
              <Stat label="Confirmation rate" value={`${data.duties.confirmationRatePct}%`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className={styles.stat}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);
