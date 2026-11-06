import { useMutation, useQuery } from "convex/react";
import { IconPrinter, IconFileTypePdf } from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";

import pageStyles from "@/components/pageStyles.module.scss";
import styles from "./PrintPage.module.scss";

type JobRow = {
  id: string;
  type: string;
  rangeStart: string;
  versionStamp: string;
  generatedAt: number;
  superseded: boolean;
};

const timeOf = (ms: number | null) => {
  if (ms === null) return "—";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
};

export const PrintPage = () => {
  const jobs = useQuery(api.print.list);
  const sheet = useQuery(api.print.runSheet);
  const generate = useMutation(api.print.generate);

  if (jobs === undefined || sheet === undefined) return <PageLoading label="Loading print…" />;
  if (jobs === null || sheet === null) return <PageUnseeded />;

  const todayIso = new Date().toISOString().slice(0, 10);

  const printNow = async () => {
    await generate({ type: "daily_run", date: todayIso });
    window.print();
  };

  const columns: RecordColumn<JobRow>[] = [
    {
      key: "type",
      label: "Sheet",
      Icon: IconFileTypePdf,
      width: 150,
      render: (r) => <Tag color="blue" text={r.type.replace(/_/g, " ")} />,
    },
    {
      key: "range",
      label: "Date",
      width: 110,
      render: (r) => <span className={pageStyles.num}>{r.rangeStart}</span>,
    },
    {
      key: "version",
      label: "Version",
      width: 300,
      render: (r) => (
        <span className={r.superseded ? pageStyles.muted : undefined}>
          {r.versionStamp}
          {r.superseded ? " · superseded" : ""}
        </span>
      ),
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconPrinter}
        title="Print"
        actions={
          <Button
            type="button"
            title="Print daily run-sheet"
            Icon={IconPrinter}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => void printNow()}
          />
        }
      />
      <div className={styles.scroll}>
        <div className={styles.sheet} id="run-sheet">
          <H2Title
            title={`Daily run — ${sheet.property}`}
            description={`${todayIso} · guests must be at the strip by the report time`}
          />
          <table className={styles.printTable}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Guest</th>
                <th>Pax</th>
                <th>Direction</th>
                <th>Carrier</th>
                <th>Staff</th>
                <th>Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {sheet.lines.map((l, i) => (
                <tr key={i}>
                  <td>{timeOf(l.time)}</td>
                  <td>{l.guest}</td>
                  <td>×{l.pax}</td>
                  <td>{l.direction === "arrival" ? "pickup ↓" : "dropoff ↑"}</td>
                  <td>{l.carrier ?? "—"}</td>
                  <td>{l.staff ?? "UNASSIGNED"}</td>
                  <td>{l.vehicle ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={pageStyles.section}>
          <H2Title title="History" description="Versioned; reprint when a later sheet supersedes" />
        </div>
        <RecordTable
          columns={columns}
          rows={jobs.rows as JobRow[]}
          rowKey={(r) => r.id}
          emptyText="Nothing printed yet."
        />
      </div>
    </div>
  );
};
