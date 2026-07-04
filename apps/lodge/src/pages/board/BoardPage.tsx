import { useMutation, useQuery } from "convex/react";
import {
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCheck,
  IconLayoutDashboard,
  IconPlaneTilt,
  IconProgressCheck,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Chip, ChipVariant } from "@ui/data-display/Chip/Chip";
import { Status } from "@ui/data-display/Status/Status";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";

import { PageHeader } from "@/components/page/PageHeader";
import { ViewBar } from "@/components/view/ViewBar";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";

import styles from "./BoardPage.module.scss";

type BoardRow = {
  id: string;
  guest: string;
  partySize: number;
  direction: "arrival" | "departure";
  mode: string;
  carrier: string | null;
  scheduledTime: number | null;
  status: string;
  needsAck: boolean;
};

const STATUS_COLOR: Record<string, "red" | "orange" | "blue" | "green" | "gray"> = {
  posted: "red",
  scheduled: "orange",
  reconfirm_required: "red",
  acknowledged: "green",
  in_transit: "blue",
  arrived: "blue",
  completed: "gray",
  escalated: "red",
};

const STATUS_LABEL: Record<string, string> = {
  posted: "Needs ack",
  scheduled: "Needs ack",
  reconfirm_required: "Re-confirm",
  acknowledged: "Acknowledged",
  in_transit: "In transit",
  arrived: "Arrived",
  completed: "Completed",
  escalated: "Escalated",
};

const timeOf = (ms: number | null) => {
  if (ms === null) return "—";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
};

export const BoardPage = () => {
  const board = useQuery(api.board.today);
  const ack = useMutation(api.ack.one);

  if (board === undefined) {
    return <div className={styles.loading}>Loading board…</div>;
  }

  if (board === null) {
    return <div className={styles.loading}>No property yet — seed the backend to begin.</div>;
  }

  const { kpis, rows } = board;

  const columns: RecordColumn<BoardRow>[] = [
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <span className={styles.recordChip}>
          <Avatar placeholder={r.guest} placeholderColorSeed={r.id} size="sm" type="squared" />
          <span className={styles.recordName}>{r.guest}</span>
        </span>
      ),
    },
    {
      key: "pax",
      label: "Pax",
      Icon: IconUsers,
      width: 60,
      render: (r) => <span className={styles.num}>×{r.partySize}</span>,
    },
    {
      key: "mode",
      label: "Mode",
      Icon: IconPlaneTilt,
      width: 130,
      render: (r) => (
        <Tag
          color={r.direction === "arrival" ? "blue" : "purple"}
          text={`${r.direction === "arrival" ? "↓" : "↑"} ${r.mode.replace("_", " ")}`}
        />
      ),
    },
    {
      key: "carrier",
      label: "Carrier",
      Icon: IconBuildingSkyscraper,
      width: 180,
      render: (r) =>
        r.carrier ? <Chip label={r.carrier} variant={ChipVariant.Static} /> : <span className={styles.muted}>—</span>,
    },
    {
      key: "time",
      label: "Time",
      Icon: IconCalendarTime,
      width: 90,
      render: (r) => <span className={styles.num}>{timeOf(r.scheduledTime)}</span>,
    },
    {
      key: "status",
      label: "Status",
      Icon: IconProgressCheck,
      width: 150,
      render: (r) => (
        <Status color={STATUS_COLOR[r.status] ?? "gray"} text={STATUS_LABEL[r.status] ?? r.status} />
      ),
    },
    {
      key: "ack",
      label: "",
      width: 140,
      render: (r) =>
        r.needsAck ? (
          <Button
            type="button"
            title="Acknowledge"
            Icon={IconCheck}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => void ack({ arrivalEventId: r.id })}
          />
        ) : null,
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader Icon={IconLayoutDashboard} title="Board" />
      <ViewBar viewName="Today" count={kpis.total}>
        {kpis.needsAck > 0 && <Tag color="red" text={`${kpis.needsAck} need ack`} />}
        {kpis.escalated > 0 && <Tag color="red" text={`${kpis.escalated} escalated`} />}
      </ViewBar>
      <RecordTable
        columns={columns}
        rows={rows as BoardRow[]}
        rowKey={(r) => r.id}
        rowClassName={(r) => (r.needsAck ? styles.needsAck : undefined)}
        countLabel="Count all"
        emptyText="No movements today."
      />
    </div>
  );
};
