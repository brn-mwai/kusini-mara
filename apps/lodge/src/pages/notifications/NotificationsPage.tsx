import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { IconBell, IconClock, IconMessage, IconUser } from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { PageTabs, type PageTab } from "@/components/tabs/PageTabs";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";

import pageStyles from "@/components/pageStyles.module.scss";

type FeedRow = {
  id: string;
  kind: "escalation" | "acknowledgment" | "activity" | "delivery";
  label: string;
  guest: string | null;
  channel: string | null;
  status: string | null;
  at: number;
};

const TABS: PageTab[] = [
  { id: "all", label: "All" },
  { id: "escalations", label: "Escalations" },
  { id: "acknowledgments", label: "Acknowledgments" },
  { id: "deliveries", label: "Deliveries" },
];

const KIND_COLOR: Record<string, "red" | "green" | "gray" | "blue"> = {
  escalation: "red",
  acknowledgment: "green",
  activity: "gray",
  delivery: "blue",
};

const timeAgo = (ms: number) => {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export const NotificationsPage = () => {
  const data = useQuery(api.notificationsq.feed);
  const [tabId, setTabId] = useState("all");

  const rows = useMemo(() => {
    if (!data) return [];
    const items = data.items as FeedRow[];
    if (tabId === "escalations") return items.filter((i) => i.kind === "escalation");
    if (tabId === "acknowledgments") return items.filter((i) => i.kind === "acknowledgment");
    if (tabId === "deliveries") return items.filter((i) => i.kind === "delivery");
    return items;
  }, [data, tabId]);

  if (data === undefined) return <PageLoading label="Loading notifications…" />;
  if (data === null) return <PageUnseeded />;

  const columns: RecordColumn<FeedRow>[] = [
    {
      key: "event",
      label: "Event",
      Icon: IconBell,
      width: 200,
      render: (r) => (
        <span className={pageStyles.tagRow}>
          <Tag color={KIND_COLOR[r.kind]} text={r.label} />
        </span>
      ),
    },
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 150,
      isEmpty: (r) => r.guest === null,
      render: (r) => r.guest ?? <span className={pageStyles.muted}>—</span>,
    },
    {
      key: "channel",
      label: "Channel",
      Icon: IconMessage,
      width: 100,
      isEmpty: (r) => r.channel === null,
      render: (r) =>
        r.channel ? <Tag color="gray" text={r.channel} /> : <span className={pageStyles.muted}>—</span>,
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      isEmpty: (r) => r.status === null,
      render: (r) =>
        r.status ? (
          <Tag color={r.status === "escalated" ? "red" : "gray"} text={r.status.replace(/_/g, " ")} />
        ) : (
          <span className={pageStyles.muted}>—</span>
        ),
    },
    {
      key: "time",
      label: "Time",
      Icon: IconClock,
      width: 110,
      render: (r) => <span className={pageStyles.muted}>{timeAgo(r.at)}</span>,
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader Icon={IconBell} title="Notifications" />
      <PageTabs tabs={TABS} activeId={tabId} onChange={setTabId} />
      <RecordTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        emptyText="No activity yet."
      />
    </div>
  );
};
