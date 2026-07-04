import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@convex/api";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { SelectField, TextField } from "@/components/form/Field";

import styles from "./NewMovementModal.module.scss";

const MODES = [
  { id: "charter", label: "Charter" },
  { id: "scheduled_flight", label: "Scheduled flight" },
  { id: "helicopter", label: "Helicopter" },
  { id: "road_transfer", label: "Road transfer" },
  { id: "self_drive", label: "Self drive" },
  { id: "self_fly", label: "Self fly" },
];

const DIRECTIONS = [
  { id: "arrival", label: "Arrival (dropping)" },
  { id: "departure", label: "Departure (picking)" },
];

const defaultTimeValue = () => {
  const d = new Date(Date.now() + 3600_000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type NewMovementModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NewMovementModal = ({ isOpen, onClose }: NewMovementModalProps) => {
  const create = useMutation(api.movements.create);

  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [direction, setDirection] = useState("arrival");
  const [mode, setMode] = useState("charter");
  const [time, setTime] = useState(defaultTimeValue);
  const [carrier, setCarrier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setGuestName("");
    setPartySize("2");
    setDirection("arrival");
    setMode("charter");
    setTime(defaultTimeValue());
    setCarrier("");
    setError(null);
  };

  const submit = async () => {
    const pax = Number(partySize);
    if (guestName.trim() === "") return setError("Guest name is required.");
    if (!Number.isInteger(pax) || pax < 1) return setError("Party size must be at least 1.");
    const scheduledTime = new Date(time).getTime();
    if (Number.isNaN(scheduledTime)) return setError("A valid time is required.");

    setSaving(true);
    setError(null);
    try {
      await create({
        guestName: guestName.trim(),
        partySize: pax,
        direction: direction as "arrival" | "departure",
        mode: mode as
          | "charter"
          | "scheduled_flight"
          | "helicopter"
          | "road_transfer"
          | "self_drive"
          | "self_fly",
        scheduledTime,
        carrierName: carrier.trim() || undefined,
      });
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create movement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="medium" ariaLabel="New movement">
      <div className={styles.body}>
        <H2Title title="New movement" description="Post a transfer onto the board" />
        <div className={styles.grid}>
          <TextField label="Guest / party" value={guestName} onChange={setGuestName} placeholder="Mombaerts" />
          <TextField label="Pax" type="number" min={1} value={partySize} onChange={setPartySize} />
          <SelectField label="Direction" value={direction} options={DIRECTIONS} onChange={setDirection} />
          <SelectField label="Mode" value={mode} options={MODES} onChange={setMode} />
          <TextField label="Time" type="datetime-local" value={time} onChange={setTime} />
          <TextField label="Carrier (optional)" value={carrier} onChange={setCarrier} placeholder="Safarilink" />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <Button type="button" title="Cancel" variant="secondary" onClick={onClose} />
          <Button
            type="button"
            title={saving ? "Posting…" : "Post movement"}
            variant="primary"
            accent="blue"
            disabled={saving}
            onClick={() => void submit()}
          />
        </div>
      </div>
    </Modal>
  );
};
