"use client";

import { ArrowsLeftRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Column, DataTable } from "./data-table";
import { Badge, Mono } from "./ui";
import {
  EVENT_LABEL,
  formatDateTime,
  truncateHash,
  type Tone,
} from "@/lib/format";

export type MovementRow = {
  key: string;
  scope: "custody" | "battery";
  at: number;
  type: string;
  subject: string;
  actor: string | null;
  note: string | null;
  hash: string;
};

const TYPE_TONE: Record<string, Tone> = {
  pickup: "info",
  handover: "info",
  arrival: "info",
  deliver: "brand",
  weigh: "neutral",
  temp_check: "neutral",
  register: "neutral",
  grade: "success",
  release: "success",
  disposition: "success",
  allocate: "brand",
  quarantine: "danger",
  triage: "danger",
};

export const MOVEMENT_COLUMNS: Column<MovementRow>[] = [
  {
    key: "at",
    label: "When",
    sortable: true,
    sortValue: (r) => r.at,
    width: "170px",
    render: (r) => <Mono>{formatDateTime(r.at)}</Mono>,
  },
  {
    key: "type",
    label: "Event",
    sortable: true,
    sortValue: (r) => r.type,
    render: (r) => (
      <Badge tone={TYPE_TONE[r.type] ?? "neutral"}>
        {EVENT_LABEL[r.type] ?? r.type}
      </Badge>
    ),
  },
  {
    key: "subject",
    label: "Subject",
    sortable: true,
    sortValue: (r) => r.subject,
    render: (r) => <Mono>{r.subject}</Mono>,
  },
  {
    key: "actor",
    label: "Actor",
    render: (r) =>
      r.actor ?? <span className="text-ink-tertiary">—</span>,
  },
  {
    key: "note",
    label: "Note",
    render: (r) =>
      r.note ? (
        <span title={r.note}>{r.note}</span>
      ) : (
        <span className="text-ink-tertiary">—</span>
      ),
  },
  {
    key: "hash",
    label: "Hash",
    align: "right",
    render: (r) => (
      <Mono className="text-ink-tertiary" title={r.hash}>
        {truncateHash(r.hash)}
      </Mono>
    ),
  },
];

export function MovementsTable({
  rows,
  toolbar,
}: {
  rows: MovementRow[] | undefined;
  toolbar?: ReactNode;
}) {
  return (
    <DataTable
      columns={MOVEMENT_COLUMNS}
      rows={rows}
      rowKey={(r) => r.key}
      toolbar={toolbar}
      empty={{
        icon: ArrowsLeftRight,
        title: "No movements yet",
        body: "Custody and unit events will appear here as soon as they are recorded.",
      }}
    />
  );
}
