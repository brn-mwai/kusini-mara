import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconAlertTriangle,
  IconPlus,
  IconSalad,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Pill } from "@ui/data-display/Pill/Pill";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { Checkbox } from "@ui/input/Checkbox/Checkbox";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField, FieldShell } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";

type GuestRow = {
  id: string;
  name: string;
  guestType: string;
  age: number | null;
  isLead: boolean;
  bookingRef: string | null;
  requirements: { id: string; category: string; label: string; severity: string }[];
  critical: boolean;
};

const GUEST_TYPES = [
  { id: "adult", label: "Adult" },
  { id: "teen", label: "Teen" },
  { id: "child", label: "Child" },
  { id: "infant", label: "Infant" },
];

const REQ_CATEGORIES = [
  { id: "dietary", label: "Dietary" },
  { id: "allergy", label: "Allergy" },
  { id: "medical", label: "Medical" },
  { id: "mobility", label: "Mobility" },
  { id: "preference", label: "Preference" },
];

const SEVERITIES = [
  { id: "preference", label: "Preference" },
  { id: "requirement", label: "Requirement" },
  { id: "critical", label: "Critical" },
];

export const GuestsPage = () => {
  const data = useQuery(api.guests.list);
  const create = useMutation(api.guests.create);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const [bookingId, setBookingId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestType, setGuestType] = useState("adult");
  const [isLead, setIsLead] = useState(false);
  const [reqCategory, setReqCategory] = useState("dietary");
  const [reqLabel, setReqLabel] = useState("");
  const [reqSeverity, setReqSeverity] = useState("requirement");
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading guests…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    if (bookingId === "") return setError("Pick the booking this guest belongs to.");
    if (lastName.trim() === "" && firstName.trim() === "") return setError("Name is required.");
    setError(null);
    try {
      await create({
        bookingId,
        firstName,
        lastName,
        guestType: guestType as "adult" | "teen" | "child" | "infant",
        isLead,
        requirement:
          reqLabel.trim() !== ""
            ? {
                category: reqCategory as "dietary" | "allergy" | "medical" | "mobility" | "accessibility" | "preference" | "other",
                label: reqLabel,
                severity: reqSeverity as "preference" | "requirement" | "critical",
              }
            : undefined,
      });
      setFirstName("");
      setLastName("");
      setReqLabel("");
      setIsNewOpen(false);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<GuestRow>[] = [
    {
      key: "name",
      label: "Name",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <span className={pageStyles.recordChip}>
          <Avatar placeholder={r.name} placeholderColorSeed={r.id} size="sm" type="rounded" />
          <span className={pageStyles.recordName}>{r.name}</span>
          {r.isLead && <Tag color="blue" text="lead" />}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      width: 90,
      render: (r) => (
        <Tag color="gray" text={r.age !== null ? `${r.guestType} · ${r.age}` : r.guestType} />
      ),
    },
    {
      key: "booking",
      label: "Booking",
      Icon: IconUsers,
      width: 140,
      isEmpty: (r) => r.bookingRef === null,
      render: (r) =>
        r.bookingRef ? r.bookingRef : <span className={pageStyles.muted}>—</span>,
    },
    {
      key: "requirements",
      label: "Requirements",
      Icon: IconSalad,
      width: 300,
      isEmpty: (r) => r.requirements.length === 0,
      render: (r) => (
        <span className={pageStyles.tagRow}>
          {r.requirements.map((req) => (
            <Pill
              key={req.id}
              label={`${req.label.replace(/_/g, " ")}${req.severity === "critical" ? " ⚠" : ""}`}
            />
          ))}
          {r.requirements.length === 0 && <span className={pageStyles.muted}>—</span>}
        </span>
      ),
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconUsers}
        title="Guests"
        actions={
          <Button
            type="button"
            title="New guest"
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
        rows={data.rows as GuestRow[]}
        rowKey={(r) => r.id}
        rowClassName={(r) => (r.critical ? pageStyles.dangerRow : undefined)}
        onAddNew={() => setIsNewOpen(true)}
        emptyText="No guests yet — add them from a booking."
      />
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New guest">
          <div className={formStyles.body}>
            <H2Title title="New guest" description="An individual traveller on a booking" />
            <div className={formStyles.grid}>
              <SelectField label="Booking" value={bookingId} options={data.bookingOptions} onChange={setBookingId} />
              <FieldShell label="Party lead">
                <Checkbox checked={isLead} onChange={() => setIsLead((v) => !v)} />
              </FieldShell>
              <TextField label="First name" value={firstName} onChange={setFirstName} />
              <TextField label="Last name" value={lastName} onChange={setLastName} />
              <SelectField label="Type" value={guestType} options={GUEST_TYPES} onChange={setGuestType} />
              <div />
              <SelectField label="Requirement (optional)" value={reqCategory} options={REQ_CATEGORIES} onChange={setReqCategory} />
              <TextField label="Label" value={reqLabel} onChange={setReqLabel} placeholder="nut_free" />
              <SelectField label="Severity" value={reqSeverity} options={SEVERITIES} onChange={setReqSeverity} />
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Add guest" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
