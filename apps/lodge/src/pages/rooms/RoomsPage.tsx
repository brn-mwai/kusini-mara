import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconBed,
  IconChevronDown,
  IconPlus,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { Checkbox } from "@ui/input/Checkbox/Checkbox";
import { H2Title } from "@ui/typography/H2Title/H2Title";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { Dropdown } from "@/components/dropdown/Dropdown";
import { PageTabs, type PageTab } from "@/components/tabs/PageTabs";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField, FieldShell } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";

type RoomRow = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  bedConfig: string;
  features: string[];
  accessible: boolean;
  housekeepingStatus: string;
  active: boolean;
};

const HK_COLOR: Record<string, "green" | "red" | "orange" | "blue" | "gray"> = {
  clean: "green",
  inspected: "green",
  dirty: "red",
  being_serviced: "orange",
  out_of_order: "gray",
};

const HK_STATUSES = ["clean", "dirty", "being_serviced", "inspected", "out_of_order"];

const ROOM_TYPES = [
  { id: "tented_suite", label: "Tented suite" },
  { id: "family_unit", label: "Family unit" },
  { id: "honeymoon", label: "Honeymoon" },
  { id: "standard", label: "Standard" },
  { id: "suite", label: "Suite" },
  { id: "villa", label: "Villa" },
];

const VIEW_TABS: PageTab[] = [
  { id: "all", label: "All" },
  { id: "ready", label: "Ready" },
  { id: "needs_service", label: "Needs service" },
  { id: "out_of_order", label: "Out of order" },
];

export const RoomsPage = () => {
  const data = useQuery(api.rooms.list);
  const setHousekeeping = useMutation(api.rooms.setHousekeeping);
  const create = useMutation(api.rooms.create);
  const [tabId, setTabId] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("tented_suite");
  const [capacity, setCapacity] = useState("2");
  const [bedConfig, setBedConfig] = useState("1 king");
  const [accessible, setAccessible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading rooms…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    if (name.trim() === "") return setError("Room name is required.");
    setError(null);
    try {
      await create({
        name,
        type: type as "tented_suite" | "family_unit" | "honeymoon" | "standard" | "suite" | "villa",
        capacity: Number(capacity) || 2,
        bedConfig,
        accessible,
      });
      setName("");
      setIsNewOpen(false);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<RoomRow>[] = [
    {
      key: "name",
      label: "Room",
      Icon: IconBed,
      width: 160,
      render: (r) => <span className={pageStyles.recordName}>{r.name}</span>,
    },
    {
      key: "type",
      label: "Type",
      width: 130,
      render: (r) => <Tag color="gray" text={r.type.replace(/_/g, " ")} />,
    },
    {
      key: "capacity",
      label: "Sleeps",
      Icon: IconUsers,
      width: 70,
      render: (r) => <span className={pageStyles.num}>{r.capacity}</span>,
    },
    {
      key: "beds",
      label: "Beds",
      width: 120,
      render: (r) => r.bedConfig,
    },
    {
      key: "housekeeping",
      label: "Housekeeping",
      Icon: IconSparkles,
      width: 170,
      render: (r) => (
        <Dropdown
          width={190}
          trigger={
            <button type="button" className={pageStyles.cellSelect}>
              <Tag color={HK_COLOR[r.housekeepingStatus] ?? "gray"} text={r.housekeepingStatus.replace(/_/g, " ")} />
              <IconChevronDown size={12} />
            </button>
          }
        >
          {(close) =>
            HK_STATUSES.map((s) => (
              <MenuItemSelect
                key={s}
                text={s.replace(/_/g, " ")}
                selected={s === r.housekeepingStatus}
                onClick={() => {
                  void setHousekeeping({
                    roomId: r.id,
                    status: s as "clean" | "dirty" | "being_serviced" | "inspected" | "out_of_order",
                  });
                  close();
                }}
              />
            ))
          }
        </Dropdown>
      ),
    },
    {
      key: "accessible",
      label: "Accessible",
      width: 90,
      render: (r) =>
        r.accessible ? <Tag color="green" text="yes" /> : <span className={pageStyles.muted}>—</span>,
    },
  ];

  const visibleRows = (data.rows as RoomRow[]).filter((r) => {
    if (tabId === "ready") return r.housekeepingStatus === "clean" || r.housekeepingStatus === "inspected";
    if (tabId === "needs_service") return r.housekeepingStatus === "dirty" || r.housekeepingStatus === "being_serviced";
    if (tabId === "out_of_order") return r.housekeepingStatus === "out_of_order";
    return true;
  });

  const markSelected = async (status: "clean" | "dirty") => {
    for (const key of selectedKeys) {
      await setHousekeeping({ roomId: key, status });
    }
    setSelectedKeys([]);
  };

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconBed}
        title="Rooms"
        selectionCount={selectedKeys.length}
        actions={
          <>
            <Button
              type="button"
              title="New room"
              Icon={IconPlus}
              variant="primary"
              accent="blue"
              size="small"
              onClick={() => setIsNewOpen(true)}
            />
            {selectedKeys.length > 0 && (
              <Button
                type="button"
                title="Mark clean"
                Icon={IconSparkles}
                variant="secondary"
                size="small"
                onClick={() => void markSelected("clean")}
              />
            )}
          </>
        }
      />
      <PageTabs tabs={VIEW_TABS} activeId={tabId} onChange={setTabId} />
      <RecordTable
        columns={columns}
        rows={visibleRows}
        rowKey={(r) => r.id}
        onAddNew={() => setIsNewOpen(true)}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        rowActions={[
          {
            label: "Mark clean",
            Icon: IconSparkles,
            onClick: (key) => void setHousekeeping({ roomId: key, status: "clean" }),
          },
          {
            label: "Mark dirty",
            Icon: IconBed,
            onClick: (key) => void setHousekeeping({ roomId: key, status: "dirty" }),
          },
        ]}
        emptyText="No rooms match."
      />
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New room">
          <div className={formStyles.body}>
            <H2Title title="New room" description="Add to the property inventory" />
            <div className={formStyles.grid}>
              <TextField label="Name" value={name} onChange={setName} placeholder="Tent 4" />
              <SelectField label="Type" value={type} options={ROOM_TYPES} onChange={setType} />
              <TextField label="Sleeps" type="number" min={1} value={capacity} onChange={setCapacity} />
              <TextField label="Bed config" value={bedConfig} onChange={setBedConfig} />
              <FieldShell label="Accessible (step-free)">
                <Checkbox checked={accessible} onChange={() => setAccessible((v) => !v)} />
              </FieldShell>
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Add room" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
