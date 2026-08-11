"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { FileArrowUp, SealCheck } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Card, Mono, PageHeader } from "@/app/components/ui";
import { formatDateTime, PERMIT_TONE } from "@/lib/format";

type Row = FunctionReturnType<typeof api.permits.myPermits>[number];

const KIND_LABEL: Record<string, string> = {
  waste_carrier: "Waste carrier",
  recycler_licence: "Recycler licence",
  second_life_cert: "Second-life certification",
};

export default function PartnersPermits() {
  const rows = useQuery(api.permits.myPermits, {});
  const submit = useMutation(api.permits.submitPermit);
  const [kind, setKind] = useState<
    "waste_carrier" | "recycler_licence" | "second_life_cert"
  >("waste_carrier");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    submit({
      kind,
      filename: file.name,
      fileSizeBytes: file.size,
    }).catch((e) => setError(e instanceof Error ? e.message : "Upload failed"));
  };

  const columns: Column<Row>[] = [
    {
      key: "kind",
      label: "Permit",
      render: (r) => KIND_LABEL[r.kind] ?? r.kind,
    },
    {
      key: "file",
      label: "Document",
      render: (r) => <Mono title={r.filename}>{r.filename}</Mono>,
    },
    {
      key: "submitted",
      label: "Submitted",
      align: "right",
      sortable: true,
      sortValue: (r) => r.submittedAt,
      render: (r) => <Mono>{formatDateTime(r.submittedAt)}</Mono>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => (
        <Badge tone={PERMIT_TONE[r.status] ?? "neutral"}>{r.status}</Badge>
      ),
    },
    {
      key: "note",
      label: "Reviewer note",
      render: (r) =>
        r.reviewerNote ? (
          <span title={r.reviewerNote}>{r.reviewerNote}</span>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
  ];

  const approved = rows?.some((r) => r.status === "approved");

  return (
    <div>
      <PageHeader
        title="Permits"
        subtitle="Stock stays visible while you wait, but interest opens only after approval"
      />

      {rows !== undefined && !approved ? (
        <Card className="mb-5">
          <p className="text-[13px] leading-5 text-ink-secondary">
            <span className="font-medium text-ink">
              No approved permit on file.
            </span>{" "}
            You can browse all available stock, but{" "}
            <span className="font-medium">Express interest</span> stays disabled
            until the Revlog compliance team approves a permit below.
          </p>
        </Card>
      ) : null}

      <div className="mb-5 rounded-card border-2 border-dashed border-line bg-card">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) upload(file);
          }}
          className={`flex flex-col items-center gap-2 rounded-card px-6 py-10 text-center transition-colors ${
            dragOver ? "bg-brand-subtle" : "hover:bg-page"
          }`}
        >
          <FileArrowUp size={28} className="text-ink-tertiary" aria-hidden />
          <div className="text-card-title">
            Drop a permit document, or click to browse
          </div>
          <label
            className="text-[13px] text-ink-secondary"
            onClick={(e) => e.stopPropagation()}
          >
            Submitting as{" "}
            <select
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as typeof kind)
              }
              className="ml-1 h-8 rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
            >
              {Object.entries(KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="sr-only"
            aria-label="Upload permit document"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
          <div className="min-h-4 text-[12px] text-danger">{error ?? ""}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        toolbar={<Toolbar count={rows?.length} countLabel="permits" />}
        empty={{
          icon: SealCheck,
          title: "No permits submitted",
          body: "Upload a waste carrier permit, recycler licence or second-life certification to get verified.",
        }}
      />
    </div>
  );
}
