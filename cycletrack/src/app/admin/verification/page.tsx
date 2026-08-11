"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { CheckCircle, SealCheck, XCircle } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Button, Mono, PageHeader } from "@/app/components/ui";
import { SidePanel } from "@/app/components/side-panel";
import { formatDateTime, PERMIT_TONE } from "@/lib/format";

type Row = FunctionReturnType<typeof api.permits.reviewQueue>[number];

const KIND_LABEL: Record<string, string> = {
  waste_carrier: "Waste carrier",
  recycler_licence: "Recycler licence",
  second_life_cert: "Second-life certification",
};

export default function AdminVerification() {
  const rows = useQuery(api.permits.reviewQueue, {});
  const review = useMutation(api.permits.review);
  const [decision, setDecision] = useState<{
    row: Row;
    decision: "approved" | "rejected";
  } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Row>[] = [
    {
      key: "org",
      label: "Organisation",
      sortable: true,
      sortValue: (r) => r.org,
      render: (r) => <span className="font-medium">{r.org}</span>,
    },
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
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) =>
        r.status === "pending" ? (
          <span className="inline-flex gap-1.5">
            <Button
              variant="secondary"
              icon={CheckCircle}
              onClick={() => {
                setDecision({ row: r, decision: "approved" });
                setNote("");
              }}
            >
              Approve
            </Button>
            <Button
              variant="ghost"
              icon={XCircle}
              onClick={() => {
                setDecision({ row: r, decision: "rejected" });
                setNote("");
              }}
            >
              Reject
            </Button>
          </span>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Verification"
        subtitle="Permit review queue for offtake partners"
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        toolbar={<Toolbar count={rows?.length} countLabel="permits" />}
        empty={{
          icon: SealCheck,
          title: "Queue is clear",
          body: "New permit submissions from partners will appear here for review.",
        }}
      />

      <SidePanel
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={
          decision?.decision === "approved"
            ? `Approve ${decision.row.org}`
            : `Reject ${decision?.row.org ?? ""}`
        }
        tone={decision?.decision === "rejected" ? "danger" : "default"}
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant={decision?.decision === "rejected" ? "danger" : "primary"}
              disabled={busy}
              onClick={() => {
                if (!decision) return;
                setBusy(true);
                setError(null);
                review({
                  permitId: decision.row._id,
                  decision: decision.decision,
                  note: note.trim() || undefined,
                })
                  .then(() => setDecision(null))
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy
                ? "Working…"
                : decision?.decision === "approved"
                  ? "Confirm approval"
                  : "Confirm rejection"}
            </Button>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-5 text-ink">
          {decision?.decision === "approved"
            ? "Approving this permit activates the partner's workspace and unlocks Express interest on stock."
            : "Rejecting keeps the partner's stock view read-only. They can resubmit a corrected document."}
        </p>
        <label className="mt-4 block text-[12px] font-medium text-ink-secondary">
          Reviewer note{" "}
          {decision?.decision === "rejected" ? "(shown to the partner)" : ""}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-ctl border border-line bg-card p-2 text-[13px] text-ink"
          />
        </label>
        <div className="mt-1 min-h-4 text-[12px] text-danger">{error ?? ""}</div>
      </SidePanel>
    </div>
  );
}
