"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Certificate, Plus, Printer } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import {
  Button,
  Mono,
  PageHeader,
  SegmentedControl,
} from "@/app/components/ui";
import { SidePanel } from "@/app/components/side-panel";
import { formatDate, formatDateTime, formatNumber, truncateHash } from "@/lib/format";

type Row = FunctionReturnType<typeof api.reports.myReports>[number];

const DAY_MS = 24 * 60 * 60 * 1000;

export default function OemRecords() {
  const rows = useQuery(api.reports.myReports, {});
  const generate = useMutation(api.reports.generate);
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<"30" | "90">("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Row>[] = [
    {
      key: "id",
      label: "Report",
      sortable: true,
      sortValue: (r) => r.reportId,
      render: (r) => <Mono className="font-medium">{r.reportId}</Mono>,
    },
    {
      key: "period",
      label: "Period",
      render: (r) => (
        <Mono>
          {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
        </Mono>
      ),
    },
    {
      key: "events",
      label: "Events",
      align: "right",
      sortable: true,
      sortValue: (r) => r.eventCount,
      render: (r) => <Mono>{formatNumber(r.eventCount)}</Mono>,
    },
    {
      key: "hash",
      label: "Content hash",
      render: (r) => (
        <Mono title={r.contentHash}>{truncateHash(r.contentHash, 16)}</Mono>
      ),
    },
    {
      key: "issued",
      label: "Issued",
      align: "right",
      sortable: true,
      sortValue: (r) => r.issuedAt,
      render: (r) => <Mono>{formatDateTime(r.issuedAt)}</Mono>,
    },
    {
      key: "print",
      label: "",
      align: "right",
      render: (r) => (
        <Link
          href={`/oem/records/${r.reportId}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-9 items-center gap-1.5 rounded-ctl border border-line bg-card px-3.5 text-[13px] font-medium text-ink hover:bg-raised"
        >
          <Printer size={16} aria-hidden />
          Certificate
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Records"
        subtitle="Chain of custody certificates over your units' event history"
        primaryAction={
          <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>
            Generate certificate
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.reportId}
        toolbar={<Toolbar count={rows?.length} countLabel="reports" />}
        empty={{
          icon: Certificate,
          title: "No certificates yet",
          body: "Generate a chain of custody certificate over a reporting period.",
          action: (
            <Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>
              Generate certificate
            </Button>
          ),
        }}
      />

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Generate chain of custody certificate"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setError(null);
                const end = Date.now();
                const start = end - Number(period) * DAY_MS;
                generate({ periodStart: start, periodEnd: end })
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
          The certificate carries a content hash computed over every event on
          your units within the period. Anyone can verify it later at its public
          verification link.
        </p>
        <div className="mt-4">
          <div className="mb-1.5 text-[12px] font-medium text-ink-secondary">
            Reporting period
          </div>
          <SegmentedControl
            ariaLabel="Reporting period"
            options={[
              { value: "30", label: "Last 30 days" },
              { value: "90", label: "Last 90 days" },
            ]}
            value={period}
            onChange={setPeriod}
          />
        </div>
        <div className="mt-2 min-h-4 text-[12px] text-danger">{error ?? ""}</div>
      </SidePanel>
    </div>
  );
}
