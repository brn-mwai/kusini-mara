"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Flask, HandCoins, Stack } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import {
  Badge,
  Button,
  FilterChip,
  Mono,
  PageHeader,
  SegmentedControl,
  Skeleton,
  EmptyState,
} from "@/app/components/ui";
import { SidePanel } from "@/app/components/side-panel";
import {
  CHEMISTRY_LABEL,
  formatKg,
  formatKwh,
  formatNumber,
  GRADE_LABEL,
  GRADE_TONE,
} from "@/lib/format";

type Row = FunctionReturnType<typeof api.batteries.availableForOfftake>[number];

const CHEMISTRY_OPTIONS = Object.entries(CHEMISTRY_LABEL).map(
  ([value, label]) => ({ value, label }),
);
const SOH_STEPS = ["any", "60", "70", "80", "90"] as const;

export default function PartnersStock() {
  const [minSoh, setMinSoh] = useState<(typeof SOH_STEPS)[number]>("any");
  const [chems, setChems] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "cards">("table");
  const [openId, setOpenId] = useState<Id<"batteries"> | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useQuery(api.batteries.availableForOfftake, {
    minSohPct: minSoh === "any" ? undefined : Number(minSoh),
  });
  const permitState = useQuery(api.permits.myPermitState, {});
  const express = useMutation(api.interests.express);

  const filtered = useMemo(() => {
    if (!rows) return undefined;
    if (chems.length === 0) return rows;
    return rows.filter((r) => chems.includes(r.chemistry));
  }, [rows, chems]);

  const openRow = filtered?.find((r) => r._id === openId) ?? null;
  const canExpress = permitState?.approved === true;
  const expressTooltip = canExpress
    ? undefined
    : permitState?.pending
      ? "Your permit is still under review — interest is disabled until it is approved"
      : "An approved permit is required before expressing interest";

  const doExpress = async () => {
    if (!openId) return;
    setBusy(true);
    setError(null);
    try {
      await express({ batteryId: openId, note: note.trim() || undefined });
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const columns: Column<Row>[] = [
    {
      key: "tag",
      label: "Tag",
      sortable: true,
      sortValue: (r) => r.tag,
      render: (r) => <Mono className="font-medium">{r.tag}</Mono>,
    },
    {
      key: "soh",
      label: "State of health",
      align: "right",
      sortable: true,
      sortValue: (r) => r.stateOfHealthPct ?? -1,
      render: (r) =>
        r.stateOfHealthPct !== null && r.stateOfHealthPct !== undefined ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-raised">
              <span
                className={`block h-full rounded-full ${
                  r.stateOfHealthPct >= 75
                    ? "bg-success"
                    : r.stateOfHealthPct >= 55
                      ? "bg-warning"
                      : "bg-danger"
                }`}
                style={{ width: `${r.stateOfHealthPct}%` }}
              />
            </span>
            <Mono>{r.stateOfHealthPct}%</Mono>
          </span>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "chemistry",
      label: "Chemistry",
      sortable: true,
      sortValue: (r) => r.chemistry,
      render: (r) => <Mono>{CHEMISTRY_LABEL[r.chemistry]}</Mono>,
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
      key: "mass",
      label: "Mass",
      align: "right",
      sortable: true,
      sortValue: (r) => r.massKg,
      render: (r) => <Mono>{formatKg(r.massKg)}</Mono>,
    },
    {
      key: "capacity",
      label: "Capacity",
      align: "right",
      sortable: true,
      sortValue: (r) => r.capacityKwh ?? -1,
      render: (r) =>
        r.capacityKwh !== null && r.capacityKwh !== undefined ? (
          <Mono>{formatKwh(r.capacityKwh)}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "interest",
      label: "Interest",
      render: (r) =>
        r.interestStatus ? (
          <Badge tone={r.interestStatus === "open" ? "brand" : "neutral"}>
            {r.interestStatus}
          </Badge>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
  ];

  const toolbar = (
    <Toolbar
      count={filtered?.length}
      countLabel="units"
      viewToggle={
        <SegmentedControl
          ariaLabel="View"
          options={[
            { value: "table", label: "Table" },
            { value: "cards", label: "Cards" },
          ]}
          value={view}
          onChange={setView}
        />
      }
    >
      <SegmentedControl
        ariaLabel="Minimum state of health"
        options={SOH_STEPS.map((s) => ({
          value: s,
          label: s === "any" ? "Any SoH" : `≥${s}%`,
        }))}
        value={minSoh}
        onChange={setMinSoh}
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
  );

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle="Graded units available for second life and material recovery, sorted by state of health"
      />
      {view === "table" ? (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r._id}
          activeKey={openId}
          onRowClick={(r) => setOpenId(r._id)}
          toolbar={toolbar}
          empty={{
            icon: Stack,
            title: "No stock matches",
            body: "Relax the state of health or chemistry filters to see more units.",
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-card shadow-sm">
          {toolbar}
          {filtered === undefined ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Stack}
                title="No stock matches"
                body="Relax the state of health or chemistry filters to see more units."
              />
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => setOpenId(r._id)}
                  className={`rounded-card border p-4 text-left shadow-sm transition-colors hover:bg-page ${
                    openId === r._id ? "border-brand bg-brand-subtle" : "border-line bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Mono className="font-medium">{r.tag}</Mono>
                    <Badge tone={GRADE_TONE[r.grade] ?? "neutral"}>
                      {GRADE_LABEL[r.grade]}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Chemistry</span>
                      <Mono>{CHEMISTRY_LABEL[r.chemistry]}</Mono>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">State of health</span>
                      {r.stateOfHealthPct != null ? (
                        <Mono>{r.stateOfHealthPct}%</Mono>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Mass</span>
                      <Mono>{formatKg(r.massKg)}</Mono>
                    </div>
                    {r.capacityKwh != null ? (
                      <div className="flex justify-between">
                        <span className="text-ink-secondary">Capacity</span>
                        <Mono>{formatKwh(r.capacityKwh)}</Mono>
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <SidePanel
        open={openRow !== null}
        onClose={() => setOpenId(null)}
        title={
          openRow ? (
            <span className="flex items-center gap-2">
              <Mono className="text-[14px] font-medium">{openRow.tag}</Mono>
              <Badge tone={GRADE_TONE[openRow.grade] ?? "neutral"}>
                {GRADE_LABEL[openRow.grade]}
              </Badge>
            </span>
          ) : (
            ""
          )
        }
        subtitle={
          openRow ? `${CHEMISTRY_LABEL[openRow.chemistry]} · ${formatKg(openRow.massKg)}` : undefined
        }
        footer={
          openRow ? (
            openRow.interestStatus === "open" ? (
              <p className="text-[13px] text-ink-secondary">
                You have an open interest on this unit.
              </p>
            ) : (
              <div>
                <label className="block text-[12px] font-medium text-ink-secondary">
                  Note to the operator (optional)
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
                  />
                </label>
                <div className="mt-1 min-h-4 text-[12px] text-danger">
                  {error ?? ""}
                </div>
                <span title={expressTooltip} className="mt-1 inline-block">
                  <Button
                    variant="primary"
                    icon={HandCoins}
                    disabled={!canExpress || busy}
                    aria-describedby={
                      expressTooltip ? "express-disabled-why" : undefined
                    }
                    onClick={() => void doExpress()}
                  >
                    {busy ? "Sending…" : "Express interest"}
                  </Button>
                </span>
                {expressTooltip ? (
                  <p
                    id="express-disabled-why"
                    className="mt-1.5 text-[12px] text-ink-tertiary"
                  >
                    {expressTooltip}
                  </p>
                ) : null}
              </div>
            )
          ) : undefined
        }
      >
        {openRow ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-card-title mb-2">
                For second-life buyers
              </h3>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">State of health</dt>
                  <dd>
                    {openRow.stateOfHealthPct != null ? (
                      <Mono>{openRow.stateOfHealthPct}%</Mono>
                    ) : (
                      <span className="text-ink-tertiary">Not measured</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Cycles used</dt>
                  <dd>
                    {openRow.cycleCount != null ? (
                      <Mono>{formatNumber(openRow.cycleCount)}</Mono>
                    ) : (
                      <span className="text-ink-tertiary">—</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Estimated remaining cycles</dt>
                  <dd>
                    {openRow.remainingCycles != null ? (
                      <Mono>{formatNumber(openRow.remainingCycles)}</Mono>
                    ) : (
                      <span className="text-ink-tertiary">—</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Capacity</dt>
                  <dd>
                    {openRow.capacityKwh != null ? (
                      <Mono>{formatKwh(openRow.capacityKwh)}</Mono>
                    ) : (
                      <span className="text-ink-tertiary">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-card-title mb-2">For recyclers</h3>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Chemistry</dt>
                  <dd>
                    <Mono>{CHEMISTRY_LABEL[openRow.chemistry]}</Mono>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-secondary">Mass</dt>
                  <dd>
                    <Mono>{formatKg(openRow.massKg)}</Mono>
                  </dd>
                </div>
              </dl>
              {openRow.dismantlingNotes ? (
                <p className="mt-2 rounded-ctl bg-raised p-3 text-[13px] text-ink-secondary">
                  {openRow.dismantlingNotes}
                </p>
              ) : (
                <p className="mt-2 text-[13px] text-ink-tertiary">
                  No dismantling notes recorded.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </SidePanel>
    </div>
  );
}
