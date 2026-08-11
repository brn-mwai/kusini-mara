"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BatteryHigh, Funnel } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, FilterChip, Mono, PageHeader } from "@/app/components/ui";
import { BatteryDetailPanel } from "@/app/components/battery-panel";
import {
  CHEMISTRY_LABEL,
  formatKg,
  formatTimeAgo,
  GRADE_LABEL,
  GRADE_TONE,
  STAGE_LABEL,
  STAGE_TONE,
} from "@/lib/format";

type Row = FunctionReturnType<typeof api.batteries.myBatteries>[number];

const STAGE_OPTIONS = Object.entries(STAGE_LABEL).map(([value, label]) => ({
  value,
  label,
}));
const GRADE_OPTIONS = Object.entries(GRADE_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default function OemBatteries() {
  const rows = useQuery(api.batteries.myBatteries, {});
  const [search, setSearch] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [openId, setOpenId] = useState<Id<"batteries"> | null>(null);

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const needle = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (needle === "" || r.tag.toLowerCase().includes(needle)) &&
        (stages.length === 0 || stages.includes(r.stage)) &&
        (grades.length === 0 || grades.includes(r.grade)),
    );
  }, [rows, search, stages, grades]);

  const columns: Column<Row>[] = [
    {
      key: "tag",
      label: "Tag",
      sortable: true,
      sortValue: (r) => r.tag,
      render: (r) => <Mono className="font-medium">{r.tag}</Mono>,
    },
    {
      key: "chemistry",
      label: "Chemistry",
      sortable: true,
      sortValue: (r) => r.chemistry,
      render: (r) => <Mono>{CHEMISTRY_LABEL[r.chemistry]}</Mono>,
    },
    {
      key: "mass",
      label: "Mass",
      align: "right",
      sortable: true,
      sortValue: (r) => r.massKg,
      render: (r) => <Mono>{formatKg(r.massKg)}</Mono>,
    },
    {
      key: "grade",
      label: "Grade",
      sortable: true,
      sortValue: (r) => r.grade,
      render: (r) => (
        <Badge tone={GRADE_TONE[r.grade] ?? "neutral"}>
          {GRADE_LABEL[r.grade]}
        </Badge>
      ),
    },
    {
      key: "stage",
      label: "Stage",
      sortable: true,
      sortValue: (r) => r.stage,
      render: (r) => (
        <Badge tone={STAGE_TONE[r.stage] ?? "neutral"}>
          {STAGE_LABEL[r.stage]}
        </Badge>
      ),
    },
    {
      key: "container",
      label: "Container",
      render: (r) =>
        r.container ? (
          <Mono>{r.container}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "last",
      label: "Last movement",
      align: "right",
      sortable: true,
      sortValue: (r) => r.lastEventAt,
      render: (r) => (
        <Mono className="text-ink-secondary">{formatTimeAgo(r.lastEventAt)}</Mono>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My batteries"
        subtitle="Every unit you registered, with its full custody trail"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r._id}
        activeKey={openId}
        onRowClick={(r) => setOpenId(r._id)}
        toolbar={
          <Toolbar
            search={search}
            onSearch={setSearch}
            count={filtered?.length}
            countLabel="units"
          >
            <FilterChip
              label="Condition"
              icon={Funnel}
              options={GRADE_OPTIONS}
              selected={grades}
              onToggle={(v) =>
                setGrades((s) =>
                  s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
                )
              }
              onClear={() => setGrades([])}
            />
            <FilterChip
              label="Stage"
              icon={Funnel}
              options={STAGE_OPTIONS}
              selected={stages}
              onToggle={(v) =>
                setStages((s) =>
                  s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
                )
              }
              onClear={() => setStages([])}
            />
          </Toolbar>
        }
        empty={{
          icon: BatteryHigh,
          title: "No units yet",
          body: "Onboard a CSV of units or register them one by one to see them here.",
        }}
      />
      <BatteryDetailPanel
        batteryId={openId}
        mode="producer"
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
