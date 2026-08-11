"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BatteryHigh, Flask, Funnel, ShieldWarning } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Button, FilterChip, Mono, PageHeader } from "@/app/components/ui";
import { BatteryDetailPanel } from "@/app/components/battery-panel";
import { SidePanel } from "@/app/components/side-panel";
import {
  CHEMISTRY_LABEL,
  formatKg,
  formatTimeAgo,
  GRADE_LABEL,
  GRADE_TONE,
  STAGE_LABEL,
  STAGE_TONE,
} from "@/lib/format";

type Row = FunctionReturnType<typeof api.batteries.registry>[number];

const STAGE_OPTIONS = Object.entries(STAGE_LABEL).map(([value, label]) => ({
  value,
  label,
}));
const GRADE_OPTIONS = Object.entries(GRADE_LABEL).map(([value, label]) => ({
  value,
  label,
}));
const CHEMISTRY_OPTIONS = Object.entries(CHEMISTRY_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export default function AdminBatteries() {
  const rows = useQuery(api.batteries.registry, {});
  const quarantine = useMutation(api.batteries.quarantineBattery);

  const [search, setSearch] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [chems, setChems] = useState<string[]>([]);
  const [openId, setOpenId] = useState<Id<"batteries"> | null>(null);
  const [bulk, setBulk] = useState<{ keys: string[]; clear: () => void } | null>(
    null,
  );
  const [bulkReason, setBulkReason] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const needle = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (needle === "" ||
          r.tag.toLowerCase().includes(needle) ||
          r.producer.toLowerCase().includes(needle)) &&
        (stages.length === 0 || stages.includes(r.stage)) &&
        (grades.length === 0 || grades.includes(r.grade)) &&
        (chems.length === 0 || chems.includes(r.chemistry)),
    );
  }, [rows, search, stages, grades, chems]);

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
      key: "producer",
      label: "Producer",
      sortable: true,
      sortValue: (r) => r.producer,
      render: (r) => r.producer,
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

  const runBulkQuarantine = async () => {
    if (!bulk || !rows) return;
    if (!bulkReason.trim()) {
      setBulkError("A reason is required");
      return;
    }
    setBulkBusy(true);
    setBulkError(null);
    try {
      const eligible = rows.filter(
        (r) => bulk.keys.includes(r._id) && !r.quarantined,
      );
      for (const r of eligible) {
        await quarantine({ batteryId: r._id, reason: bulkReason.trim() });
      }
      bulk.clear();
      setBulk(null);
      setBulkReason("");
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Battery registry"
        subtitle="Every unit on the network, with full custody trails"
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r._id}
        activeKey={openId}
        onRowClick={(r) => setOpenId(r._id)}
        selectable
        selectionActions={(keys, clear) => (
          <Button
            variant="danger"
            icon={ShieldWarning}
            onClick={() => setBulk({ keys, clear })}
          >
            Quarantine
          </Button>
        )}
        toolbar={
          <Toolbar
            search={search}
            onSearch={setSearch}
            count={filtered?.length}
            countLabel="units"
          >
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
              label="Chemistry"
              icon={Flask}
              options={CHEMISTRY_OPTIONS}
              selected={chems}
              onToggle={(v) =>
                setChems((s) =>
                  s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
                )
              }
              onClear={() => setChems([])}
            />
          </Toolbar>
        }
        empty={{
          icon: BatteryHigh,
          title: "No batteries match",
          body: "Adjust the filters, or register units through onboarding and field collection.",
        }}
      />

      <BatteryDetailPanel
        batteryId={openId}
        mode="staff"
        onClose={() => setOpenId(null)}
      />

      <SidePanel
        open={bulk !== null}
        onClose={() => setBulk(null)}
        title="Quarantine selected units"
        tone="danger"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              disabled={bulkBusy}
              onClick={() => void runBulkQuarantine()}
            >
              {bulkBusy
                ? "Working…"
                : `Confirm quarantine (${bulk?.keys.length ?? 0})`}
            </Button>
            <Button variant="ghost" onClick={() => setBulk(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-5 text-ink">
          This holds{" "}
          <Mono className="font-medium">{bulk?.keys.length ?? 0}</Mono> selected
          units for safety review. Quarantined units leave the offtake pool
          immediately and stay held until released one by one.
        </p>
        <label className="mt-4 block text-[12px] font-medium text-ink-secondary">
          Reason (required)
          <input
            value={bulkReason}
            onChange={(e) => setBulkReason(e.target.value)}
            className="mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
          />
        </label>
        <div className="mt-1 min-h-4 text-[12px] text-danger">
          {bulkError ?? ""}
        </div>
      </SidePanel>
    </div>
  );
}
