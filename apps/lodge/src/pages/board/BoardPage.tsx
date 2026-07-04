import { useMutation, useQuery } from "convex/react";
import {
  IconCheck,
  IconPlaneArrival,
  IconPlaneDeparture,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Button } from "@ui/input/Button/Button";
import { Status } from "@ui/data-display/Status/Status";
import { Tag } from "@ui/data-display/Tag/Tag";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import styles from "./BoardPage.module.scss";

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

  const { kpis, rows, property } = board;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <H2Title
          title={`Today — ${property.name}`}
          description="Movements, unacknowledged first"
        />
      </header>

      <div className={styles.kpis}>
        <KpiCard label="Movements" value={kpis.total} />
        <KpiCard label="Needs ack" value={kpis.needsAck} tone={kpis.needsAck > 0 ? "danger" : "default"} />
        <KpiCard label="Arrivals" value={kpis.arrivals} />
        <KpiCard label="Departures" value={kpis.departures} />
        <KpiCard label="Escalated" value={kpis.escalated} tone={kpis.escalated > 0 ? "danger" : "default"} />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Guest</th>
              <th>Pax</th>
              <th>Mode</th>
              <th>Carrier</th>
              <th>Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.needsAck ? styles.needsAck : undefined}>
                <td className={styles.dirCell}>
                  {r.direction === "arrival" ? (
                    <IconPlaneArrival size={16} />
                  ) : (
                    <IconPlaneDeparture size={16} />
                  )}
                </td>
                <td className={styles.guestCell}>{r.guest}</td>
                <td>×{r.partySize}</td>
                <td>
                  <Tag color="gray" text={r.mode.replace("_", " ")} />
                </td>
                <td>{r.carrier ?? "—"}</td>
                <td className={styles.timeCell}>{timeOf(r.scheduledTime)}</td>
                <td>
                  <Status
                    color={STATUS_COLOR[r.status] ?? "gray"}
                    text={STATUS_LABEL[r.status] ?? r.status}
                  />
                </td>
                <td className={styles.actionCell}>
                  {r.needsAck && (
                    <Button
                      type="button"
                      title="Acknowledge"
                      Icon={IconCheck}
                      variant="primary"
                      accent="blue"
                      size="small"
                      onClick={() => void ack({ arrivalEventId: r.id })}
                    />
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No movements today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "danger";
}) => (
  <div className={styles.kpi} data-tone={tone}>
    <span className={styles.kpiValue}>{value}</span>
    <span className={styles.kpiLabel}>{label}</span>
  </div>
);
