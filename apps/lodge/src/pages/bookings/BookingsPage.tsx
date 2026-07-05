import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconCalendar,
  IconDownload,
  IconPlane,
  IconPlus,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField } from "@/components/form/Field";
import { exportCsv } from "@/lib/exportCsv";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";

type BookingRow = {
  id: string;
  guestName: string;
  partySize: number;
  source: string;
  arrivalDate: string;
  departureDate: string;
  movements: { id: string; direction: string; status: string }[];
};

const SOURCES = [
  { id: "manual", label: "Manual" },
  { id: "pms_resrequest", label: "ResRequest" },
  { id: "pms_karibukit", label: "KaribuKit" },
  { id: "agent", label: "Agent" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export const BookingsPage = () => {
  const data = useQuery(api.bookings.list);
  const create = useMutation(api.bookings.create);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [arrivalDate, setArrivalDate] = useState(todayIso());
  const [departureDate, setDepartureDate] = useState(todayIso());
  const [source, setSource] = useState("manual");
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading bookings…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    const pax = Number(partySize);
    if (guestName.trim() === "") return setError("Guest name is required.");
    if (!Number.isInteger(pax) || pax < 1) return setError("Party size must be at least 1.");
    setError(null);
    try {
      await create({
        guestName: guestName.trim(),
        partySize: pax,
        arrivalDate,
        departureDate,
        source: source as "manual" | "pms_resrequest" | "pms_karibukit" | "agent",
      });
      setGuestName("");
      setIsNewOpen(false);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<BookingRow>[] = [
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <span className={pageStyles.recordChip}>
          <Avatar placeholder={r.guestName} placeholderColorSeed={r.id} size="sm" type="squared" />
          <span className={pageStyles.recordName}>{r.guestName}</span>
        </span>
      ),
    },
    {
      key: "pax",
      label: "Pax",
      Icon: IconUsers,
      width: 60,
      render: (r) => <span className={pageStyles.num}>×{r.partySize}</span>,
    },
    {
      key: "arrival",
      label: "Arrival",
      Icon: IconCalendar,
      width: 110,
      render: (r) => <span className={pageStyles.num}>{r.arrivalDate}</span>,
    },
    {
      key: "departure",
      label: "Departure",
      Icon: IconCalendar,
      width: 110,
      render: (r) => <span className={pageStyles.num}>{r.departureDate}</span>,
    },
    {
      key: "source",
      label: "Source",
      width: 110,
      render: (r) => <Tag color="gray" text={r.source.replace("pms_", "")} />,
    },
    {
      key: "movements",
      label: "Movements",
      Icon: IconPlane,
      width: 220,
      isEmpty: (r) => r.movements.length === 0,
      render: (r) => (
        <span className={pageStyles.tagRow}>
          {r.movements.map((m) => (
            <Tag
              key={m.id}
              color={m.status === "acknowledged" ? "green" : "orange"}
              text={`${m.direction === "arrival" ? "↓" : "↑"} ${m.status}`}
            />
          ))}
          {r.movements.length === 0 && <span className={pageStyles.muted}>none</span>}
        </span>
      ),
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconPlane}
        title="Bookings"
        actions={
          <Button
            type="button"
            title="New booking"
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => setIsNewOpen(true)}
          />
        }
        menuItems={[
          {
            label: "Export CSV",
            Icon: IconDownload,
            onClick: () =>
              exportCsv(
                "kusini-bookings.csv",
                ["Guest", "Pax", "Arrival", "Departure", "Source"],
                data.rows.map((r) => [r.guestName, r.partySize, r.arrivalDate, r.departureDate, r.source]),
              ),
          },
        ]}
      />
      <RecordTable
        columns={columns}
        rows={data.rows as BookingRow[]}
        rowKey={(r) => r.id}
        onAddNew={() => setIsNewOpen(true)}
        emptyText="No bookings yet."
      />
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New booking">
          <div className={formStyles.body}>
            <H2Title title="New booking" description="Spawns the arrival and departure movements" />
            <div className={formStyles.grid}>
              <TextField label="Guest / party" value={guestName} onChange={setGuestName} placeholder="Mombaerts" />
              <TextField label="Pax" type="number" min={1} value={partySize} onChange={setPartySize} />
              <TextField label="Arrival date" type="text" value={arrivalDate} onChange={setArrivalDate} placeholder="2026-07-05" />
              <TextField label="Departure date" type="text" value={departureDate} onChange={setDepartureDate} placeholder="2026-07-08" />
              <SelectField label="Source" value={source} options={SOURCES} onChange={setSource} />
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Create booking" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
