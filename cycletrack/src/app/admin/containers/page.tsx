"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { ArrowSquareOut, Package } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Mono, PageHeader } from "@/app/components/ui";
import { formatKg, formatPct, formatTimeAgo, type Tone } from "@/lib/format";

type Row = FunctionReturnType<typeof api.containers.containerRegister>[number];

const STAGE_TONE: Record<string, Tone> = {
  deployed: "success",
  in_transit: "info",
  at_facility: "neutral",
};
const LABEL_TONE: Record<string, Tone> = {
  bound: "success",
  printed: "info",
  revoked: "danger",
  none: "neutral",
};

export default function AdminContainers() {
  const rows = useQuery(api.containers.containerRegister, {});
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.tag.toLowerCase().includes(needle) ||
        (r.site ?? "").toLowerCase().includes(needle),
    );
  }, [rows, search]);

  const columns: Column<Row>[] = [
    {
      key: "tag",
      label: "Tag",
      sortable: true,
      sortValue: (r) => r.tag,
      render: (r) => <Mono className="font-medium">{r.tag}</Mono>,
    },
    {
      key: "site",
      label: "Site",
      sortable: true,
      sortValue: (r) => r.site ?? "",
      render: (r) => r.site ?? <span className="text-ink-tertiary">—</span>,
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      sortValue: (r) => r.stage,
      render: (r) => (
        <Badge tone={STAGE_TONE[r.stage] ?? "neutral"}>
          {r.stage.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "fill",
      label: "Fill",
      align: "right",
      sortable: true,
      sortValue: (r) => r.fillPct,
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-raised">
            <span
              className={`block h-full rounded-full ${
                r.fillPct >= 85 ? "bg-danger" : r.fillPct >= 60 ? "bg-warning" : "bg-success"
              }`}
              style={{ width: `${r.fillPct}%` }}
            />
          </span>
          <Mono>{formatPct(r.fillPct, { of100: true })}</Mono>
        </span>
      ),
    },
    {
      key: "mass",
      label: "Contents",
      align: "right",
      sortable: true,
      sortValue: (r) => r.currentMassKg,
      render: (r) => <Mono>{formatKg(r.currentMassKg)}</Mono>,
    },
    {
      key: "temp",
      label: "Last temp check",
      align: "right",
      render: (r) =>
        r.lastTempCheckAt ? (
          <Mono>
            {r.lastTempC !== null ? `${r.lastTempC}°C · ` : ""}
            {formatTimeAgo(r.lastTempCheckAt)}
          </Mono>
        ) : (
          <span className="text-ink-tertiary">Never</span>
        ),
    },
    {
      key: "label",
      label: "Label",
      render: (r) => (
        <Badge tone={LABEL_TONE[r.labelState] ?? "neutral"}>{r.labelState}</Badge>
      ),
    },
    {
      key: "public",
      label: "Public record",
      align: "right",
      render: (r) => (
        <a
          href={`/q/${r.publicToken}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-brand hover:underline"
        >
          <Mono className="text-brand">/q/{r.publicToken.slice(0, 6)}…</Mono>
          <ArrowSquareOut size={12} aria-hidden />
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Containers"
        subtitle="Deployment state, fill and safety checks for every container"
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
            countLabel="containers"
          />
        }
        empty={{
          icon: Package,
          title: "No containers registered",
          body: "Containers appear here once deployed to collection points or producer sites.",
        }}
      />
    </div>
  );
}
