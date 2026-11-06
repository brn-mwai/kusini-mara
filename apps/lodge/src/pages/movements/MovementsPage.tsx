import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import {
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconCheck,
  IconDownload,
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

import { PageTabs, type PageTab } from "@/components/tabs/PageTabs";
import { PageHeader } from "@/components/page/PageHeader";
import {
  RecordPanel,
  type PanelGroup,
  type PanelRelatedSection,
  type PanelTimelineItem,
} from "@/components/record/RecordPanel";
import { ViewBar } from "@/components/view/ViewBar";
import { exportCsv } from "@/lib/exportCsv";
import { getObjectDef } from "@/objects/registry";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";

import { useMovementRecord } from "./useMovementRecord";
import styles from "./MovementsPage.module.scss";

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
  awaitingFlight: boolean;
  dateIso: string | null;
};

const movementDef = getObjectDef("movement");
const optionOf = (fieldName: string, value: string) =>
  movementDef.field(fieldName)?.options?.find((o) => o.value === value);


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

const todayIso = () => new Date().toISOString().slice(0, 10);

const VIEW_TABS: PageTab[] = [
  { id: "today", label: "Today" },
  { id: "arrivals", label: "Arrivals" },
  { id: "departures", label: "Departures" },
  { id: "awaiting_flight", label: "Awaiting flight" },
  { id: "needs_attention", label: "Needs attention" },
  { id: "all", label: "All" },
];

export const MovementsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const board = useQuery(api.board.today);
  const ack = useMutation(api.ack.one);
  const ackMany = useMutation(api.ack.many);
  const createDraft = useMutation(api.movements.createDraft);

  const initialView = searchParams.get("view");
  const [tabId, setTabId] = useState(
    VIEW_TABS.some((t) => t.id === initialView) ? (initialView as string) : "today",
  );
  const [filterIds, setFilterIds] = useState<string[]>([]);
  const [sortId, setSortId] = useState("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const {
    selected,
    panelGroups,
    relatedSections,
    timelineItems,
    updateMovement,
  } = useMovementRecord(selectedId);

  const rows = useMemo(() => {
    if (!board) return [];
    let result = [...(board.rows as BoardRow[])];

    if (tabId === "today") {
      result = result.filter((r) => r.dateIso === todayIso());
    } else if (tabId === "arrivals") {
      result = result.filter((r) => r.direction === "arrival");
    } else if (tabId === "departures") {
      result = result.filter((r) => r.direction === "departure");
    } else if (tabId === "awaiting_flight") {
      result = result.filter((r) => r.awaitingFlight);
    } else if (tabId === "needs_attention") {
      result = result.filter((r) => r.needsAck || r.status === "escalated");
    }

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
  }, [board, tabId, filterIds, sortId, sortDirection]);

  if (board === undefined) {
    return <div className={styles.loading}>Loading board…</div>;
  }
  if (board === null) {
    return <div className={styles.loading}>No property yet — seed the backend to begin.</div>;
  }

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
      render: (r) => {
        const dir = optionOf("direction", r.direction);
        const mode = optionOf("mode", r.mode);
        return (
          <span className={styles.pillRow}>
            <Tag
              color={(dir?.color as "blue" | "purple") ?? "gray"}
              text={r.direction === "arrival" ? "↓ Pickup" : "↑ Dropoff"}
            />
            <Tag
              color={(mode?.color as "blue" | "sky" | "turquoise" | "green" | "yellow" | "orange") ?? "gray"}
              text={mode?.label ?? r.mode.replace(/_/g, " ")}
            />
          </span>
        );
      },
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
      render: (r) => {
        const opt = optionOf("status", r.status);
        return (
          <Tag
            color={(opt?.color as "red" | "orange" | "green" | "blue" | "gray") ?? "gray"}
            text={opt?.label ?? r.status}
          />
        );
      },
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

  const ackSelected = async () => {
    const ackable = rows
      .filter((r) => selectedKeys.includes(r.id) && r.needsAck)
      .map((r) => r.id);
    if (ackable.length > 0) await ackMany({ arrivalEventIds: ackable });
    setSelectedKeys([]);
  };

  return (
    <div className={styles.withPanel}>
    <div className={styles.page}>
      <PageHeader
        Icon={IconPlaneTilt}
        title="Movements"
        selectionCount={selectedKeys.length}
        actions={
          <>
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
            {selectedKeys.length > 0 && (
              <Button
                type="button"
                title="Acknowledge"
                Icon={IconCheck}
                variant="secondary"
                size="small"
                onClick={() => void ackSelected()}
              />
            )}
          </>
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
      <PageTabs tabs={VIEW_TABS} activeId={tabId} onChange={setTabId} />
      <ViewBar
        views={[{ id: tabId, label: VIEW_TABS.find((t) => t.id === tabId)!.label }]}
        activeViewId={tabId}
        onViewChange={() => undefined}
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
      />
      <RecordTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        onAddNew={() => void createDraft().then(({ id }) => setSelectedId(id))}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        rowActions={[
          {
            label: "Acknowledge",
            Icon: IconCheck,
            onClick: (key) => void ack({ arrivalEventId: key }),
          },
          {
            label: "Open record",
            Icon: IconPlaneTilt,
            onClick: (key) => navigate(`/movements/${key}`),
          },
        ]}
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
        related={relatedSections}
        timeline={timelineItems}
        recordId={selected.id}
        onOpen={() => navigate(`/movements/${selected.id}`)}
        onClose={() => setSelectedId(null)}
      />
    )}
    </div>
  );
};
