import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCheck,
  IconChecklist,
  IconDownload,
  IconLayoutDashboard,
  IconList,
  IconPlaneTilt,
  IconPlus,
  IconProgressCheck,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Chip, ChipVariant } from "@ui/data-display/Chip/Chip";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";

import { PageHeader } from "@/components/page/PageHeader";
import { RecordPanel, type PanelGroup } from "@/components/record/RecordPanel";
import { ViewBar } from "@/components/view/ViewBar";
import { exportCsv } from "@/lib/exportCsv";
import {
  RecordTable,
  type BulkAction,
  type RecordColumn,
} from "@/components/table/RecordTable";

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

const VIEWS = [
  { id: "today", label: "Today", Icon: IconList },
  { id: "needs_ack", label: "Needs ack", Icon: IconChecklist },
  { id: "escalations", label: "Escalations", Icon: IconAlertTriangle },
];

const FILTER_OPTIONS = [
  { id: "dir:arrival", label: "Arrivals" },
  { id: "dir:departure", label: "Departures" },
  { id: "mode:charter", label: "Charter" },
  { id: "mode:scheduled_flight", label: "Scheduled flight" },
  { id: "mode:helicopter", label: "Helicopter" },
  { id: "mode:road_transfer", label: "Road transfer" },
  { id: "mode:self_drive", label: "Self drive" },
  { id: "mode:self_fly", label: "Self fly" },
];

const SORT_FIELDS = [
  { id: "time", label: "Time" },
  { id: "guest", label: "Guest" },
  { id: "status", label: "Status" },
];

const timeOf = (ms: number | null) => {
  if (ms === null) return "—";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
};

export const BoardPage = () => {
  const board = useQuery(api.board.today);
  const ack = useMutation(api.ack.one);
  const ackMany = useMutation(api.ack.many);
  const createDraft = useMutation(api.movements.createDraft);
  const updateMovement = useMutation(api.movements.update);

  const [viewId, setViewId] = useState("today");
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [sortId, setSortId] = useState("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useQuery(
    api.movements.get,
    selectedId === null ? "skip" : { id: selectedId },
  );

  const rows = useMemo(() => {
    if (!board) return [];
    let result = [...(board.rows as BoardRow[])];

    if (viewId === "needs_ack") result = result.filter((r) => r.needsAck);
    if (viewId === "escalations") result = result.filter((r) => r.status === "escalated");

    const dirFilters = filterIds.filter((f) => f.startsWith("dir:")).map((f) => f.slice(4));
    const modeFilters = filterIds.filter((f) => f.startsWith("mode:")).map((f) => f.slice(5));
    if (dirFilters.length > 0) result = result.filter((r) => dirFilters.includes(r.direction));
    if (modeFilters.length > 0) result = result.filter((r) => modeFilters.includes(r.mode));

    const dir = sortDirection === "asc" ? 1 : -1;
    result.sort((a, b) => {
      if (sortId === "guest") return a.guest.localeCompare(b.guest) * dir;
      if (sortId === "status") return a.status.localeCompare(b.status) * dir;
      return ((a.scheduledTime ?? Infinity) - (b.scheduledTime ?? Infinity)) * dir;
    });
    return result;
  }, [board, viewId, filterIds, sortId, sortDirection]);

  if (board === undefined) {
    return <div className={styles.loading}>Loading board…</div>;
  }
  if (board === null) {
    return <div className={styles.loading}>No property yet — seed the backend to begin.</div>;
  }

  const { kpis } = board;

  const columns: RecordColumn<BoardRow>[] = [
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <button
          type="button"
          className={styles.recordButton}
          onClick={() => setSelectedId(r.id)}
        >
          <Avatar placeholder={r.guest} placeholderColorSeed={r.id} size="sm" type="squared" />
          <span className={styles.recordName}>{r.guest}</span>
        </button>
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
      isEmpty: (r) => r.carrier === null,
      render: (r) =>
        r.carrier ? (
          <Chip label={r.carrier} variant={ChipVariant.Static} />
        ) : (
          <span className={styles.muted}>—</span>
        ),
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
        <Tag color={STATUS_COLOR[r.status] ?? "gray"} text={STATUS_LABEL[r.status] ?? r.status} />
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

  const bulkActions: BulkAction[] = [
    {
      label: "Acknowledge",
      Icon: IconCheck,
      onClick: async (keys) => {
        const ackable = rows.filter((r) => keys.includes(r.id) && r.needsAck).map((r) => r.id);
        if (ackable.length > 0) await ackMany({ arrivalEventIds: ackable });
      },
    },
  ];

  const toLocalInput = (ms: number | null) => {
    if (ms === null) return "";
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const panelGroups: PanelGroup[] = selected
    ? [
        {
          label: "General",
          fields: [
            {
              kind: "number",
              key: "pax",
              label: "Pax",
              Icon: IconUsers,
              value: String(selected.partySize),
              onCommit: (v) =>
                void updateMovement({ id: selected.id, partySize: Number(v) || 1 }),
            },
            {
              kind: "select",
              key: "direction",
              label: "Direction",
              Icon: IconPlaneTilt,
              value: selected.direction,
              options: [
                { id: "arrival", label: "Arrival (dropping)" },
                { id: "departure", label: "Departure (picking)" },
              ],
              onCommit: (v) =>
                void updateMovement({
                  id: selected.id,
                  direction: v as "arrival" | "departure",
                }),
            },
            {
              kind: "select",
              key: "mode",
              label: "Mode",
              value: selected.mode,
              options: [
                { id: "charter", label: "Charter" },
                { id: "scheduled_flight", label: "Scheduled flight" },
                { id: "helicopter", label: "Helicopter" },
                { id: "road_transfer", label: "Road transfer" },
                { id: "self_drive", label: "Self drive" },
                { id: "self_fly", label: "Self fly" },
              ],
              onCommit: (v) =>
                void updateMovement({
                  id: selected.id,
                  mode: v as
                    | "charter"
                    | "scheduled_flight"
                    | "helicopter"
                    | "road_transfer"
                    | "self_drive"
                    | "self_fly",
                }),
            },
          ],
        },
        {
          label: "Transfer",
          fields: [
            {
              kind: "text",
              key: "carrier",
              label: "Carrier",
              Icon: IconBuildingSkyscraper,
              value: selected.carrierName,
              placeholder: "Safarilink",
              onCommit: (v) => void updateMovement({ id: selected.id, carrierName: v }),
            },
            {
              kind: "text",
              key: "time",
              label: "Time",
              Icon: IconCalendarTime,
              value: toLocalInput(selected.scheduledTime),
              placeholder: "2026-07-05T11:00",
              onCommit: (v) => {
                const ms = new Date(v).getTime();
                if (!Number.isNaN(ms)) void updateMovement({ id: selected.id, scheduledTime: ms });
              },
            },
          ],
        },
        {
          label: "System",
          fields: [
            {
              kind: "readonly",
              key: "status",
              label: "Status",
              Icon: IconProgressCheck,
              content: (
                <Tag
                  color={STATUS_COLOR[selected.status] ?? "gray"}
                  text={STATUS_LABEL[selected.status] ?? selected.status}
                />
              ),
            },
          ],
        },
      ]
    : [];

  return (
    <div className={styles.withPanel}>
    <div className={styles.page}>
      <PageHeader
        Icon={IconLayoutDashboard}
        title="Board"
        actions={
          <Button
            type="button"
            title="New movement"
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() =>
              void createDraft().then(({ id }) => setSelectedId(id))
            }
          />
        }
        menuItems={[
          {
            label: "Export CSV",
            Icon: IconDownload,
            onClick: () =>
              exportCsv(
                "kusini-board.csv",
                ["Guest", "Pax", "Direction", "Mode", "Carrier", "Time", "Status"],
                rows.map((r) => [
                  r.guest,
                  r.partySize,
                  r.direction,
                  r.mode,
                  r.carrier,
                  timeOf(r.scheduledTime),
                  r.status,
                ]),
              ),
          },
        ]}
      />
      <ViewBar
        views={VIEWS}
        activeViewId={viewId}
        onViewChange={setViewId}
        count={rows.length}
        filterOptions={FILTER_OPTIONS}
        activeFilterIds={filterIds}
        onFilterToggle={(id) =>
          setFilterIds((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
          )
        }
        sortFields={SORT_FIELDS}
        activeSortId={sortId}
        sortDirection={sortDirection}
        onSortChange={(id, dir) => {
          setSortId(id);
          setSortDirection(dir);
        }}
        chips={
          kpis.needsAck > 0 ? <Tag color="red" text={`${kpis.needsAck} need ack`} /> : undefined
        }
      />
      <RecordTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        rowClassName={(r) => (r.needsAck ? styles.needsAck : undefined)}
        onAddNew={() => void createDraft().then(({ id }) => setSelectedId(id))}
        bulkActions={bulkActions}
        emptyText="No movements match."
      />
    </div>
    {selected && (
      <RecordPanel
        title={selected.guestName}
        onTitleCommit={(v) => void updateMovement({ id: selected.id, guestName: v })}
        avatarSeed={selected.id}
        subtitle="Movement"
        groups={panelGroups}
        onClose={() => setSelectedId(null)}
      />
    )}
    </div>
  );
};
