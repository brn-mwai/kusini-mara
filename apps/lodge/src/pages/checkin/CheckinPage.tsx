import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconBed,
  IconCalendar,
  IconChevronDown,
  IconLogin,
  IconLogout,
  IconProgressCheck,
  IconUser,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Banner } from "@ui/feedback/Banner/Banner";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";

import { PageLoading, PageUnseeded } from "@/components/PageState";
import { Dropdown } from "@/components/dropdown/Dropdown";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";

type StayRow = {
  id: string;
  guest: string;
  roomId: string | null;
  roomName: string | null;
  roomReady: boolean;
  plannedCheckIn: string;
  plannedCheckOut: string;
  status: string;
  boardBasis: string;
  heads: number;
};

const STAY_COLOR: Record<string, "gray" | "orange" | "blue" | "green" | "red"> = {
  reserved: "gray",
  due_in: "orange",
  checked_in: "green",
  in_house: "green",
  due_out: "orange",
  checked_out: "gray",
  no_show: "red",
  cancelled: "gray",
};

const NEXT_ACTION: Record<string, { to: string; label: string; Icon: typeof IconLogin } | undefined> = {
  reserved: { to: "due_in", label: "Due in", Icon: IconCalendar },
  due_in: { to: "checked_in", label: "Check in", Icon: IconLogin },
  checked_in: { to: "in_house", label: "In house", Icon: IconBed },
  in_house: { to: "due_out", label: "Due out", Icon: IconCalendar },
  due_out: { to: "checked_out", label: "Check out", Icon: IconLogout },
};

export const CheckinView = () => {
  const data = useQuery(api.stays.board);
  const transition = useMutation(api.stays.transition);
  const assignRoom = useMutation(api.stays.assignRoom);
  const create = useMutation(api.stays.create);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading stays…" />;
  if (data === null) return <PageUnseeded />;

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<StayRow>[] = [
    {
      key: "guest",
      label: "Guest",
      Icon: IconUser,
      width: 180,
      render: (r) => (
        <span className={pageStyles.recordChip}>
          <Avatar placeholder={r.guest} placeholderColorSeed={r.id} size="sm" type="squared" />
          <span className={pageStyles.recordName}>{r.guest}</span>
        </span>
      ),
    },
    {
      key: "room",
      label: "Room",
      Icon: IconBed,
      width: 160,
      isEmpty: (r) => r.roomId === null,
      render: (r) => (
        <Dropdown
          width={200}
          trigger={
            <button type="button" className={pageStyles.cellSelect}>
              {r.roomName ? (
                <span>
                  {r.roomName}
                  {!r.roomReady && <span className={pageStyles.muted}> · not ready</span>}
                </span>
              ) : (
                <span className={pageStyles.placeholder}>Assign room…</span>
              )}
              <IconChevronDown size={12} />
            </button>
          }
        >
          {(close) =>
            data.roomOptions.map((room) => (
              <MenuItemSelect
                key={room.id}
                text={`${room.label}${room.ready ? "" : " · not ready"}`}
                selected={room.id === r.roomId}
                onClick={() => {
                  void act(() => assignRoom({ stayId: r.id, roomId: room.id }));
                  close();
                }}
              />
            ))
          }
        </Dropdown>
      ),
    },
    {
      key: "dates",
      label: "Dates",
      Icon: IconCalendar,
      width: 180,
      render: (r) => (
        <span className={pageStyles.num}>
          {r.plannedCheckIn} → {r.plannedCheckOut}
        </span>
      ),
    },
    {
      key: "heads",
      label: "Heads",
      width: 60,
      render: (r) => <span className={pageStyles.num}>×{r.heads}</span>,
    },
    {
      key: "status",
      label: "Status",
      Icon: IconProgressCheck,
      width: 130,
      render: (r) => (
        <Tag color={STAY_COLOR[r.status] ?? "gray"} text={r.status.replace(/_/g, " ")} />
      ),
    },
    {
      key: "action",
      label: "",
      width: 130,
      render: (r) => {
        const next = NEXT_ACTION[r.status];
        if (!next) return null;
        return (
          <Button
            type="button"
            title={next.label}
            Icon={next.Icon}
            variant="secondary"
            size="small"
            onClick={() =>
              void act(() =>
                transition({
                  stayId: r.id,
                  to: next.to as "due_in" | "checked_in" | "in_house" | "due_out" | "checked_out",
                }),
              )
            }
          />
        );
      },
    },
  ];

  const submit = async () => {
    if (bookingId === "") return setError("Pick a booking.");
    await act(() => create({ bookingId, roomId: roomId || undefined }));
    setIsNewOpen(false);
  };

  return (
    <>
      {error && (
        <Banner color="danger">
          <span className={pageStyles.bannerText}>{error}</span>
        </Banner>
      )}
      <RecordTable
        columns={columns}
        rows={data.rows as StayRow[]}
        rowKey={(r) => r.id}
        onAddNew={() => setIsNewOpen(true)}
        emptyText="No stays — create one from a booking."
      />
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New stay">
          <div className={formStyles.body}>
            <H2Title title="New stay" description="One per room a booking occupies" />
            <div className={formStyles.grid}>
              <SelectField label="Booking" value={bookingId} options={data.bookingOptions} onChange={setBookingId} />
              <SelectField
                label="Room (optional)"
                value={roomId}
                options={data.roomOptions.map((r) => ({ id: r.id, label: r.label }))}
                onChange={setRoomId}
              />
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Create stay" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
