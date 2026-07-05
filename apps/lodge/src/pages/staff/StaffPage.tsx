import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconLanguage,
  IconPhone,
  IconPlus,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { LinkChip } from "@ui/data-display/LinkChip/LinkChip";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { Toggle } from "@ui/input/Toggle/Toggle";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";

type StaffRow = {
  id: string;
  name: string;
  role: string;
  phone: string;
  languages: string[];
  allowedLeaveDays: number;
  active: boolean;
};

const ROLES = [
  { id: "guide", label: "Guide" },
  { id: "driver", label: "Driver" },
  { id: "porter", label: "Porter" },
  { id: "front_desk", label: "Front desk" },
  { id: "housekeeping", label: "Housekeeping" },
];

export const StaffPage = () => {
  const data = useQuery(api.staffm.list);
  const create = useMutation(api.staffm.create);
  const setActive = useMutation(api.staffm.setActive);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("guide");
  const [phone, setPhone] = useState("+254");
  const [languages, setLanguages] = useState("EN, SW");
  const [leaveDays, setLeaveDays] = useState("21");
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading staff…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    if (firstName.trim() === "" && lastName.trim() === "") return setError("Name is required.");
    setError(null);
    try {
      await create({
        firstName,
        lastName,
        role: role as "guide" | "driver" | "porter" | "front_desk" | "housekeeping",
        phone,
        languages,
        allowedLeaveDays: Number(leaveDays) || 21,
      });
      setFirstName("");
      setLastName("");
      setIsNewOpen(false);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<StaffRow>[] = [
    {
      key: "name",
      label: "Name",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <span className={pageStyles.recordChip}>
          <Avatar placeholder={r.name} placeholderColorSeed={r.id} size="sm" type="rounded" />
          <span className={pageStyles.recordName}>{r.name}</span>
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      width: 110,
      render: (r) => <Tag color="blue" text={r.role.replace(/_/g, " ")} />,
    },
    {
      key: "phone",
      label: "Phone",
      Icon: IconPhone,
      width: 150,
      render: (r) => <LinkChip label={r.phone} to={`tel:${r.phone}`} />,
    },
    {
      key: "languages",
      label: "Languages",
      Icon: IconLanguage,
      width: 140,
      isEmpty: (r) => r.languages.length === 0,
      render: (r) => (
        <span className={pageStyles.tagRow}>
          {r.languages.map((l) => (
            <Tag key={l} color="gray" text={l} />
          ))}
        </span>
      ),
    },
    {
      key: "leave",
      label: "Leave days",
      width: 90,
      render: (r) => <span className={pageStyles.num}>{r.allowedLeaveDays}</span>,
    },
    {
      key: "active",
      label: "Active",
      width: 80,
      render: (r) => (
        <Toggle
          value={r.active}
          onChange={(value) => void setActive({ staffId: r.id, active: value })}
        />
      ),
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconUsersGroup}
        title="Staff"
        actions={
          <Button
            type="button"
            title="New staff"
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => setIsNewOpen(true)}
          />
        }
      />
      <RecordTable
        columns={columns}
        rows={data.rows as StaffRow[]}
        rowKey={(r) => r.id}
        onAddNew={() => setIsNewOpen(true)}
        emptyText="No staff yet."
      />
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New staff">
          <div className={formStyles.body}>
            <H2Title title="New staff member" description="Joins the duty + leave rosters" />
            <div className={formStyles.grid}>
              <TextField label="First name" value={firstName} onChange={setFirstName} />
              <TextField label="Last name" value={lastName} onChange={setLastName} />
              <SelectField label="Role" value={role} options={ROLES} onChange={setRole} />
              <TextField label="Phone (SMS)" value={phone} onChange={setPhone} />
              <TextField label="Languages" value={languages} onChange={setLanguages} placeholder="EN, SW, MAA" />
              <TextField label="Annual leave days" type="number" min={0} value={leaveDays} onChange={setLeaveDays} />
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Add staff" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
