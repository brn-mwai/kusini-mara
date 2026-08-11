"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { MapPin } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Mono, PageHeader } from "@/app/components/ui";
import { formatPct } from "@/lib/format";

type Row = FunctionReturnType<typeof api.points.listPointsForStaff>[number];

function ToggleCell({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!value);
      }}
      className={`relative h-5 w-9 rounded-full transition-colors ${
        value ? "bg-brand" : "bg-raised border border-line"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-0.5 size-4 rounded-full bg-card shadow-sm transition-all ${
          value ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function AdminPoints() {
  const rows = useQuery(api.points.listPointsForStaff, {});
  const setActive = useMutation(api.points.setPointActive);
  const setPublic = useMutation(api.points.setPointPublic);
  const [search, setSearch] = useState("");

  const filtered = rows?.filter((r) =>
    r.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Site",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "address",
      label: "Address",
      render: (r) => <span title={r.address}>{r.address}</span>,
    },
    {
      key: "hours",
      label: "Hours",
      render: (r) => <Mono>{r.hours}</Mono>,
    },
    {
      key: "accepted",
      label: "Accepted items",
      render: (r) => (
        <span title={r.acceptedItems.join(", ")}>
          {r.acceptedItems.slice(0, 2).join(", ")}
          {r.acceptedItems.length > 2 ? ` +${r.acceptedItems.length - 2}` : ""}
        </span>
      ),
    },
    {
      key: "containers",
      label: "Containers",
      align: "right",
      sortable: true,
      sortValue: (r) => r.containerCount,
      render: (r) => <Mono>{r.containerCount}</Mono>,
    },
    {
      key: "fill",
      label: "Fill",
      align: "right",
      sortable: true,
      sortValue: (r) => r.fillPct ?? -1,
      render: (r) =>
        r.fillPct === null ? (
          <span className="text-ink-tertiary">—</span>
        ) : (
          <Mono>{formatPct(r.fillPct, { of100: true })}</Mono>
        ),
    },
    {
      key: "public",
      label: "Public listing",
      render: (r) => (
        <ToggleCell
          value={r.isPublic}
          label={`Toggle public listing for ${r.name}`}
          onChange={(next) => void setPublic({ pointId: r._id, isPublic: next })}
        />
      ),
    },
    {
      key: "active",
      label: "Active",
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <ToggleCell
            value={r.active}
            label={`Toggle active state for ${r.name}`}
            onChange={(next) => void setActive({ pointId: r._id, active: next })}
          />
          <Badge tone={r.active ? "success" : "neutral"}>
            {r.active ? "Active" : "Paused"}
          </Badge>
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Collection points"
        subtitle="Hours, accepted items, public listing and service state"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r._id}
        toolbar={
          <Toolbar
            search={search}
            onSearch={setSearch}
            count={filtered?.length}
            countLabel="points"
          />
        }
        empty={{
          icon: MapPin,
          title: "No collection points",
          body: "Points appear here once the network is provisioned.",
        }}
      />
    </div>
  );
}
