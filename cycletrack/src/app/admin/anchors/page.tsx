"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Anchor } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Mono, PageHeader } from "@/app/components/ui";
import { formatDate, formatNumber, truncateHash } from "@/lib/format";

type Row = FunctionReturnType<typeof api.anchors.list>[number];

export default function AdminAnchors() {
  const rows = useQuery(api.anchors.list, {});

  const columns: Column<Row>[] = [
    {
      key: "period",
      label: "Period",
      sortable: true,
      sortValue: (r) => r.periodStart,
      render: (r) => (
        <Mono>
          {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
        </Mono>
      ),
    },
    {
      key: "root",
      label: "Merkle root",
      render: (r) => (
        <Mono title={r.merkleRoot}>{truncateHash(r.merkleRoot, 18)}</Mono>
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
      key: "provider",
      label: "Provider",
      render: (r) => r.provider,
    },
    {
      key: "tx",
      label: "Transaction",
      render: (r) =>
        r.txId ? (
          <Mono title={r.txId}>{truncateHash(r.txId, 14)}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
    {
      key: "state",
      label: "Confirmation",
      sortable: true,
      sortValue: (r) => r.state,
      render: (r) => (
        <Badge
          tone={
            r.state === "confirmed"
              ? "success"
              : r.state === "submitted"
                ? "info"
                : "warning"
          }
        >
          {r.state}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Anchors"
        subtitle="Weekly event digests committed to an external timestamping provider"
      />
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r._id}
        toolbar={<Toolbar count={rows?.length} countLabel="periods" />}
        empty={{
          icon: Anchor,
          title: "No anchored periods",
          body: "Periods appear here after the first weekly digest is committed.",
        }}
      />
    </div>
  );
}
