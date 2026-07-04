import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconCalendarTime,
  IconDownload,
  IconCar,
  IconChevronDown,
  IconClipboardList,
  IconProgressCheck,
  IconUser,
  IconUsers,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Banner } from "@ui/feedback/Banner/Banner";
import { Status } from "@ui/data-display/Status/Status";
import { Tag } from "@ui/data-display/Tag/Tag";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItemSelectAvatar } from "@ui/navigation/MenuItemSelectAvatar/MenuItemSelectAvatar";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";

import { PageHeader } from "@/components/page/PageHeader";
import { exportCsv } from "@/lib/exportCsv";
import { Dropdown } from "@/components/dropdown/Dropdown";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";

import styles from "./DutiesPage.module.scss";

type DutyRow = {
  eventId: string;
  dutyId: string | null;
  guest: string;
  partySize: number;
  direction: "arrival" | "departure";
  scheduledTime: number | null;
  dutyType: string;
  dutyStatus: string;
  staffId: string | null;
  staffName: string | null;
  vehicleId: string | null;
  vehicleName: string | null;
  vehicleSeats: number | null;
  seatShortfall: number;
};

const DUTY_STATUS_COLOR: Record<string, "gray" | "orange" | "blue" | "green"> = {
  unassigned: "gray",
  assigned: "blue",
  notified: "orange",
  accepted: "green",
  completed: "green",
};

const timeOf = (ms: number | null) => {
  if (ms === null) return "—";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
};

export const DutiesPage = () => {
  const board = useQuery(api.duties.board);
  const assign = useMutation(api.duties.assign);
  const clear = useMutation(api.duties.clear);
  const [error, setError] = useState<string | null>(null);

  if (board === undefined) {
    return <div className={styles.loading}>Loading duties…</div>;
  }
  if (board === null) {
    return <div className={styles.loading}>No property yet — seed the backend to begin.</div>;
  }

  const { rows, staff, vehicles } = board;

  const tryAssign = async (
    eventId: string,
    patch: { staffId?: string; vehicleId?: string },
  ) => {
    setError(null);
    try {
      await assign({ arrivalEventId: eventId, ...patch });
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Assignment failed.";
      const match = raw.match(/Uncaught Error: (.*?)(?: at handler|$)/);
      setError(match?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<DutyRow>[] = [
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 180,
      render: (r) => (
        <span className={styles.recordChip}>
          <Avatar placeholder={r.guest} placeholderColorSeed={r.eventId} size="sm" type="squared" />
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
      key: "time",
      label: "Time",
      Icon: IconCalendarTime,
      width: 80,
      render: (r) => <span className={styles.num}>{timeOf(r.scheduledTime)}</span>,
    },
    {
      key: "duty",
      label: "Duty",
      Icon: IconClipboardList,
      width: 140,
      render: (r) => (
        <Tag
          color={r.direction === "arrival" ? "blue" : "purple"}
          text={r.dutyType === "airstrip_pickup" ? "Airstrip pickup" : "Airstrip dropoff"}
        />
      ),
    },
    {
      key: "staff",
      label: "Staff",
      Icon: IconUserPlus,
      width: 180,
      isEmpty: (r) => r.staffId === null,
      render: (r) => (
        <Dropdown
          width={220}
          trigger={
            <button type="button" className={styles.cellSelect}>
              {r.staffName ? (
                <span className={styles.recordChip}>
                  <Avatar placeholder={r.staffName} size="sm" type="rounded" />
                  {r.staffName}
                </span>
              ) : (
                <span className={styles.placeholder}>Assign staff…</span>
              )}
              <IconChevronDown size={12} />
            </button>
          }
        >
          {(close) =>
            staff.map((s) => (
              <MenuItemSelectAvatar
                key={s.id}
                avatar={<Avatar placeholder={s.name} size="sm" type="rounded" />}
                text={s.name}
                contextualText={s.role.replace("_", " ")}
                selected={s.id === r.staffId}
                onClick={() => {
                  void tryAssign(r.eventId, { staffId: s.id });
                  close();
                }}
              />
            ))
          }
        </Dropdown>
      ),
    },
    {
      key: "vehicle",
      label: "Vehicle",
      Icon: IconCar,
      width: 180,
      isEmpty: (r) => r.vehicleId === null,
      render: (r) => (
        <Dropdown
          width={220}
          trigger={
            <button type="button" className={styles.cellSelect}>
              {r.vehicleName ? (
                <span>
                  {r.vehicleName}
                  <span className={styles.muted}> · {r.vehicleSeats} seats</span>
                </span>
              ) : (
                <span className={styles.placeholder}>Assign vehicle…</span>
              )}
              <IconChevronDown size={12} />
            </button>
          }
        >
          {(close) =>
            vehicles.map((vh) => (
              <MenuItemSelect
                key={vh.id}
                text={`${vh.name} (${vh.seats} seats)`}
                selected={vh.id === r.vehicleId}
                onClick={() => {
                  void tryAssign(r.eventId, { vehicleId: vh.id });
                  close();
                }}
              />
            ))
          }
        </Dropdown>
      ),
    },
    {
      key: "status",
      label: "Status",
      Icon: IconProgressCheck,
      width: 130,
      render: (r) => (
        <Status
          color={DUTY_STATUS_COLOR[r.dutyStatus] ?? "gray"}
          text={r.dutyStatus.replace("_", " ")}
        />
      ),
    },
    {
      key: "clear",
      label: "",
      width: 50,
      render: (r) =>
        r.dutyId !== null || r.staffId !== null || r.vehicleId !== null ? (
          <LightIconButton
            Icon={IconX}
            size="small"
            accent="tertiary"
            onClick={() => void clear({ arrivalEventId: r.eventId })}
          />
        ) : null,
    },
  ] as RecordColumn<DutyRow>[];

  return (
    <div className={styles.page}>
      <PageHeader
        Icon={IconClipboardList}
        title="Duties"
        menuItems={[
          {
            label: "Export CSV",
            Icon: IconDownload,
            onClick: () =>
              exportCsv(
                "kusini-duties.csv",
                ["Guest", "Pax", "Time", "Duty", "Staff", "Vehicle", "Status"],
                rows.map((r) => [
                  r.guest,
                  r.partySize,
                  timeOf(r.scheduledTime),
                  r.dutyType,
                  r.staffName,
                  r.vehicleName,
                  r.dutyStatus,
                ]),
              ),
          },
        ]}
      />
      {error && (
        <Banner color="danger">
          <span className={styles.bannerText}>{error}</span>
        </Banner>
      )}
      <RecordTable
        columns={columns}
        rows={rows as DutyRow[]}
        rowKey={(r) => r.eventId}
        rowClassName={(r) => (r.seatShortfall > 0 ? styles.shortfall : undefined)}
        emptyText="No ground jobs today."
      />
    </div>
  );
};
