"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  CheckCircle,
  FileCsv,
  UploadSimple,
  XCircle,
} from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import {
  Badge,
  Button,
  Card,
  Mono,
  PageHeader,
} from "@/app/components/ui";
import {
  dryRun,
  guessColumn,
  parseCsv,
  type Chemistry,
  type DryRunRow,
} from "@/lib/csv";
import { formatKg, formatNumber } from "@/lib/format";

type MappingField = "tag" | "chemistry" | "massKg" | "capacityKwh";

const FIELD_LABELS: Record<MappingField, string> = {
  tag: "Tag",
  chemistry: "Chemistry",
  massKg: "Mass (kg)",
  capacityKwh: "Capacity (kWh, optional)",
};

const GUESSES: Record<MappingField, string[]> = {
  tag: ["tag", "serial", "id"],
  chemistry: ["chem"],
  massKg: ["mass", "weight", "kg"],
  capacityKwh: ["kwh", "capacity"],
};

export default function OemOnboard() {
  const myBatteries = useQuery(api.batteries.myBatteries, {});
  const onboard = useMutation(api.trail.onboardBatch);

  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<MappingField, number | null>>({
    tag: null,
    chemistry: null,
    massKg: null,
    capacityKwh: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    created: number;
    rejected: { tag: string; reason: string }[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File) => {
    setError(null);
    setResult(null);
    void file.text().then((text) => {
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setError("The file needs a header row and at least one data row.");
        return;
      }
      const head = parsed[0]!;
      setFileName(file.name);
      setHeaders(head);
      setDataRows(parsed.slice(1));
      setMapping({
        tag: guessColumn(head, GUESSES.tag),
        chemistry: guessColumn(head, GUESSES.chemistry),
        massKg: guessColumn(head, GUESSES.massKg),
        capacityKwh: guessColumn(head, GUESSES.capacityKwh),
      });
    });
  };

  const existingTags = useMemo(
    () => new Set((myBatteries ?? []).map((b) => b.tag.toUpperCase())),
    [myBatteries],
  );

  const preview: DryRunRow[] | null = useMemo(() => {
    if (
      dataRows.length === 0 ||
      mapping.tag === null ||
      mapping.chemistry === null ||
      mapping.massKg === null
    )
      return null;
    return dryRun(
      dataRows.map((row, i) => ({
        line: i + 2,
        tag: row[mapping.tag!] ?? "",
        chemistry: row[mapping.chemistry!] ?? "",
        massKg: row[mapping.massKg!] ?? "",
        capacityKwh:
          mapping.capacityKwh !== null ? (row[mapping.capacityKwh] ?? "") : "",
      })),
      existingTags,
    );
  }, [dataRows, mapping, existingTags]);

  const creatable = preview?.filter((r) => r.ok) ?? [];

  const columns: Column<DryRunRow>[] = [
    {
      key: "line",
      label: "Line",
      width: "64px",
      align: "right",
      render: (r) => <Mono className="text-ink-tertiary">{r.line}</Mono>,
    },
    {
      key: "tag",
      label: "Tag",
      render: (r) =>
        r.tag ? <Mono>{r.tag}</Mono> : <span className="text-ink-tertiary">—</span>,
    },
    {
      key: "chemistry",
      label: "Chemistry",
      render: (r) =>
        r.chemistry ? (
          <Mono>{r.chemistry.replace("_", "-")}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "mass",
      label: "Mass",
      align: "right",
      render: (r) =>
        r.massKg !== null ? (
          <Mono>{formatKg(r.massKg)}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "outcome",
      label: "Outcome",
      render: (r) =>
        r.ok ? (
          <Badge tone="success">Will create</Badge>
        ) : (
          <Badge tone="danger">Rejected</Badge>
        ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (r) =>
        r.reason ?? <span className="text-ink-tertiary">—</span>,
    },
  ];

  const commit = async () => {
    if (creatable.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await onboard({
        rows: creatable.map((r) => ({
          tag: r.tag,
          chemistry: r.chemistry as Chemistry,
          massKg: r.massKg!,
          capacityKwh: r.capacityKwh,
        })),
      });
      setResult(res);
      setDataRows([]);
      setHeaders([]);
      setFileName(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Commit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Onboard units"
        subtitle="Upload a CSV, map its columns, review the dry run, then commit"
      />

      {result ? (
        <Card className="mb-5">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="mt-0.5 text-success" aria-hidden />
            <div>
              <div className="text-card-title">
                Created {formatNumber(result.created)} units
              </div>
              {result.rejected.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[13px] text-ink-secondary">
                  {result.rejected.map((r) => (
                    <li key={r.tag} className="flex items-center gap-2">
                      <XCircle size={14} className="text-danger" aria-hidden />
                      <Mono>{r.tag}</Mono> — {r.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[13px] text-ink-secondary">
                  No rows were rejected by the server.
                </p>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {dataRows.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) readFile(file);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-16 text-center transition-colors ${
            dragOver
              ? "border-brand bg-brand-subtle"
              : "border-line bg-card hover:bg-page"
          }`}
        >
          <UploadSimple size={28} className="text-ink-tertiary" aria-hidden />
          <div className="text-card-title">Drop a CSV here, or click to browse</div>
          <p className="max-w-sm text-[13px] text-ink-secondary">
            Expected columns: tag, chemistry, mass in kilograms, and optionally
            capacity in kWh. You will map them on the next step.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-label="Upload CSV"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) readFile(file);
              e.target.value = "";
            }}
          />
        </button>
      ) : (
        <div className="space-y-5">
          <Card
            title={
              <span className="flex items-center gap-2">
                <FileCsv size={16} aria-hidden />
                {fileName}
              </span>
            }
            actions={
              <Button
                variant="ghost"
                onClick={() => {
                  setDataRows([]);
                  setHeaders([]);
                  setFileName(null);
                }}
              >
                Remove file
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(FIELD_LABELS) as MappingField[]).map((field) => (
                <label
                  key={field}
                  className="block text-[12px] font-medium text-ink-secondary"
                >
                  {FIELD_LABELS[field]}
                  <select
                    value={mapping[field] ?? ""}
                    onChange={(e) =>
                      setMapping((m) => ({
                        ...m,
                        [field]:
                          e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                    className="mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
                  >
                    <option value="">Not mapped</option>
                    {headers.map((h, i) => (
                      <option key={`${h}${i}`} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </Card>

          {preview === null ? (
            <Card>
              <p className="text-[13px] text-ink-secondary">
                Map the tag, chemistry and mass columns to see the dry run.
              </p>
            </Card>
          ) : (
            <>
              <DataTable
                columns={columns}
                rows={preview}
                rowKey={(r) => String(r.line)}
                toolbar={
                  <Toolbar count={preview.length} countLabel="rows">
                    <Badge tone="success">
                      {formatNumber(creatable.length)} will create
                    </Badge>
                    <Badge tone="danger">
                      {formatNumber(preview.length - creatable.length)} rejected
                    </Badge>
                  </Toolbar>
                }
                empty={{
                  icon: FileCsv,
                  title: "Nothing to preview",
                  body: "The file has no data rows.",
                }}
              />
              <div className="flex items-center justify-end gap-3">
                <div className="min-h-4 text-[12px] text-danger">
                  {error ?? ""}
                </div>
                {/* Commit is deliberately separate and explicit. */}
                <Button
                  variant="primary"
                  disabled={busy || creatable.length === 0}
                  onClick={() => void commit()}
                >
                  {busy
                    ? "Committing…"
                    : `Commit ${formatNumber(creatable.length)} units`}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
