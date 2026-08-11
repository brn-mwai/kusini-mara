"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Buildings } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Button, Mono, PageHeader } from "@/app/components/ui";
import { SidePanel } from "@/app/components/side-panel";
import {
  formatDate,
  formatNumber,
  ORG_STATUS_TONE,
  PERMIT_TONE,
} from "@/lib/format";

type Row = FunctionReturnType<typeof api.orgs.list>[number];

export default function AdminOrgs() {
  const rows = useQuery(api.orgs.list, {});
  const setStatus = useMutation(api.orgs.setStatus);
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = rows?.filter((r) =>
    r.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const columns: Column<Row>[] = [
    {
      key: "name",
      label: "Organisation",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "kind",
      label: "Kind",
      sortable: true,
      sortValue: (r) => `${r.kind}${r.partnerKind ?? ""}`,
      render: (r) => (
        <span className="capitalize">
          {r.kind === "partner"
            ? (r.partnerKind ?? "partner").replace("_", " ")
            : r.kind}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => (
        <Badge tone={ORG_STATUS_TONE[r.status] ?? "neutral"}>{r.status}</Badge>
      ),
    },
    {
      key: "permits",
      label: "Permits",
      render: (r) =>
        r.permitState === null ? (
          <span className="text-ink-tertiary">—</span>
        ) : (
          <Badge tone={PERMIT_TONE[r.permitState] ?? "neutral"}>
            {r.permitState}
          </Badge>
        ),
    },
    {
      key: "units",
      label: "Units",
      align: "right",
      sortable: true,
      sortValue: (r) => r.unitCount ?? -1,
      render: (r) =>
        r.unitCount === null ? (
          <span className="text-ink-tertiary">—</span>
        ) : (
          <Mono>{formatNumber(r.unitCount)}</Mono>
        ),
    },
    {
      key: "since",
      label: "Member since",
      align: "right",
      sortable: true,
      sortValue: (r) => r.createdAt,
      render: (r) => <Mono>{formatDate(r.createdAt)}</Mono>,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) =>
        r.status === "suspended" ? (
          <Button
            variant="secondary"
            onClick={() => void setStatus({ orgId: r._id, status: "active" })}
          >
            Reactivate
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setConfirming(r)}>
            Suspend
          </Button>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Organisations"
        subtitle="Producers and offtake partners on the network"
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
            countLabel="organisations"
          />
        }
        empty={{
          icon: Buildings,
          title: "No organisations",
          body: "Producers and partners appear here once onboarded.",
        }}
      />

      <SidePanel
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={`Suspend ${confirming?.name ?? ""}`}
        tone="danger"
        footer={
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              disabled={busy}
              onClick={() => {
                if (!confirming) return;
                setBusy(true);
                setError(null);
                setStatus({ orgId: confirming._id, status: "suspended" })
                  .then(() => setConfirming(null))
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Failed"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? "Working…" : "Confirm suspension"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-[13px] leading-5 text-ink">
          Suspending an organisation blocks its console access and removes its
          open interests. Custody records are untouched. This can be reversed by
          reactivating later.
        </p>
        <div className="mt-2 min-h-4 text-[12px] text-danger">{error ?? ""}</div>
      </SidePanel>
    </div>
  );
}
