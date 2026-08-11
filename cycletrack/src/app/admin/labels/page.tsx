"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Plus, Printer, Tag } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Button, Mono, PageHeader } from "@/app/components/ui";
import { SidePanel } from "@/app/components/side-panel";
import { formatDateTime, formatNumber } from "@/lib/format";

type Row = FunctionReturnType<typeof api.labels.batches>[number];

export default function AdminLabels() {
  const rows = useQuery(api.labels.batches, {});
  const generate = useMutation(api.labels.generateBatch);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState("100");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Row>[] = [
    {
      key: "code",
      label: "Batch",
      sortable: true,
      sortValue: (r) => r.code,
      render: (r) => <Mono className="font-medium">{r.code}</Mono>,
    },
    {
      key: "created",
      label: "Generated",
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => <Mono>{formatDateTime(r.createdAt)}</Mono>,
    },
    {
      key: "count",
      label: "Tokens",
      align: "right",
      sortable: true,
      sortValue: (r) => r.count,
      render: (r) => <Mono>{formatNumber(r.count)}</Mono>,
    },
    {
      key: "printed",
      label: "Printed",
      align: "right",
      render: (r) => <Mono>{formatNumber(r.printed)}</Mono>,
    },
    {
      key: "bound",
      label: "Bound",
      align: "right",
      render: (r) => <Mono className="text-success">{formatNumber(r.bound)}</Mono>,
    },
    {
      key: "revoked",
      label: "Revoked",
      align: "right",
      render: (r) => (
        <Mono className={r.revoked > 0 ? "text-danger" : ""}>
          {formatNumber(r.revoked)}
        </Mono>
      ),
    },
    {
      key: "print",
      label: "",
      align: "right",
      render: (r) => (
        <Link
          href={`/admin/labels/${r._id}/print`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-9 items-center gap-1.5 rounded-ctl border border-line bg-card px-3.5 text-[13px] font-medium text-ink hover:bg-raised"
        >
          <Printer size={16} aria-hidden />
          Print sheet
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Labels"
        subtitle="Token batches for physical unit labels"
        primaryAction={
          <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>
            Generate batch
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        toolbar={<Toolbar count={rows?.length} countLabel="batches" />}
        empty={{
          icon: Tag,
          title: "No label batches",
          body: "Generate a token batch to print physical labels for incoming units.",
          action: (
            <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>
              Generate batch
            </Button>
          ),
        }}
      />

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Generate token batch"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => {
                const n = Number(count);
                if (!Number.isInteger(n) || n < 1 || n > 500) {
                  setError("Enter a whole number between 1 and 500");
                  return;
                }
                setBusy(true);
                setError(null);
                generate({ count: n })
                  .then(() => setOpen(false))
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? "Generating…" : "Generate"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-5 text-ink-secondary">
          Each token becomes a printable label with a QR that resolves to the
          unit&apos;s public record once bound.
        </p>
        <label className="mt-4 block text-[12px] font-medium text-ink-secondary">
          Number of tokens (1–500)
          <input
            value={count}
            onChange={(e) => setCount(e.target.value)}
            inputMode="numeric"
            className="mono mt-1 h-9 w-full rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
          />
        </label>
        <div className="mt-1 min-h-4 text-[12px] text-danger">{error ?? ""}</div>
      </SidePanel>
    </div>
  );
}
