"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Package, Truck } from "@phosphor-icons/react";
import { Column, DataTable, Toolbar } from "@/app/components/data-table";
import { Badge, Mono, PageHeader } from "@/app/components/ui";
import {
  COLLECTION_TONE,
  formatDate,
  formatKg,
  formatPct,
  formatTimeAgo,
} from "@/lib/format";

type ContainerRow = FunctionReturnType<typeof api.containers.myContainers>[number];
type CollectionRow = FunctionReturnType<typeof api.collections.myCollections>[number];

export default function OemService() {
  const containers = useQuery(api.containers.myContainers, {});
  const collections = useQuery(api.collections.myCollections, {});

  const containerColumns: Column<ContainerRow>[] = [
    {
      key: "tag",
      label: "Container",
      sortable: true,
      sortValue: (r) => r.tag,
      render: (r) => <Mono className="font-medium">{r.tag}</Mono>,
    },
    {
      key: "site",
      label: "Site",
      render: (r) => r.site ?? "Your premises",
    },
    {
      key: "stage",
      label: "Stage",
      render: (r) => (
        <Badge
          tone={
            r.stage === "deployed"
              ? "success"
              : r.stage === "in_transit"
                ? "info"
                : "neutral"
          }
        >
          {r.stage.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "fill",
      label: "Fill",
      align: "right",
      sortable: true,
      sortValue: (r) => r.fillPct,
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-raised">
            <span
              className={`block h-full rounded-full ${
                r.fillPct >= 85
                  ? "bg-danger"
                  : r.fillPct >= 60
                    ? "bg-warning"
                    : "bg-success"
              }`}
              style={{ width: `${r.fillPct}%` }}
            />
          </span>
          <Mono>{formatPct(r.fillPct, { of100: true })}</Mono>
        </span>
      ),
    },
    {
      key: "contents",
      label: "Contents",
      align: "right",
      render: (r) => <Mono>{formatKg(r.currentMassKg)}</Mono>,
    },
    {
      key: "temp",
      label: "Last temp check",
      align: "right",
      render: (r) =>
        r.lastTempCheckAt ? (
          <Mono>
            {r.lastTempC !== null ? `${r.lastTempC}°C · ` : ""}
            {formatTimeAgo(r.lastTempCheckAt)}
          </Mono>
        ) : (
          <span className="text-ink-tertiary">Never</span>
        ),
    },
  ];

  const collectionColumns: Column<CollectionRow>[] = [
    {
      key: "date",
      label: "Scheduled",
      sortable: true,
      sortValue: (r) => r.scheduledFor,
      render: (r) => <Mono>{formatDate(r.scheduledFor)}</Mono>,
    },
    {
      key: "container",
      label: "Container",
      render: (r) => <Mono>{r.container}</Mono>,
    },
    { key: "site", label: "Site", render: (r) => r.site },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => (
        <Badge tone={COLLECTION_TONE[r.status] ?? "neutral"}>
          {r.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "expected",
      label: "Expected fill",
      align: "right",
      render: (r) => <Mono>{formatPct(r.expectedFillPct, { of100: true })}</Mono>,
    },
    {
      key: "collected",
      label: "Collected",
      align: "right",
      render: (r) =>
        r.collectedMassKg !== null ? (
          <Mono>{formatKg(r.collectedMassKg)}</Mono>
        ) : (
          <span className="text-ink-tertiary">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Service"
        subtitle="Containers on your sites and their scheduled collections"
      />
      <div className="space-y-6">
        <DataTable
          columns={containerColumns}
          rows={containers}
          rowKey={(r) => r._id}
          toolbar={<Toolbar count={containers?.length} countLabel="containers" />}
          empty={{
            icon: Package,
            title: "No containers on site",
            body: "Containers deployed to your premises will show here with fill and safety checks.",
          }}
        />
        <DataTable
          columns={collectionColumns}
          rows={collections}
          rowKey={(r) => r._id}
          toolbar={<Toolbar count={collections?.length} countLabel="collections" />}
          empty={{
            icon: Truck,
            title: "No collections scheduled",
            body: "Scheduled and completed collections of your containers appear here.",
          }}
        />
      </div>
    </div>
  );
}
