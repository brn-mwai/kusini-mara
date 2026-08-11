"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import { Package } from "@phosphor-icons/react";
import { MapCanvas, type MapMarker } from "@/app/components/map-canvas";
import { SidePanel } from "@/app/components/side-panel";
import { Badge, Mono, PageHeader, Skeleton } from "@/app/components/ui";
import { formatKg, formatPct, formatTimeAgo } from "@/lib/format";

type Point = FunctionReturnType<typeof api.points.listPointsForStaff>[number];

export default function AdminMap() {
  const points = useQuery(api.points.listPointsForStaff, {});
  const containers = useQuery(api.containers.containerRegister, {});
  const [openPointId, setOpenPointId] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(() => {
    const out: MapMarker[] = [];
    for (const p of points ?? []) {
      out.push({
        id: `point:${p._id}`,
        lat: p.lat,
        lng: p.lng,
        tone: p.active ? "brand" : "danger",
        label: p.name,
      });
    }
    for (const c of containers ?? []) {
      if (c.lat !== null && c.lng !== null && c.stage === "in_transit") {
        out.push({
          id: `container:${c._id}`,
          lat: c.lat,
          lng: c.lng,
          tone: "info",
          label: `${c.tag} (in transit)`,
        });
      }
    }
    return out;
  }, [points, containers]);

  const openPoint: Point | null =
    (openPointId &&
      points?.find((p) => `point:${p._id}` === openPointId)) ||
    null;
  const pointContainers = openPoint
    ? (containers ?? []).filter((c) => c.site === openPoint.name)
    : [];

  return (
    <div>
      <PageHeader
        title="Network map"
        subtitle="Collection points and container positions"
      />
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1">
          {points === undefined
            ? Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-16" />
              ))
            : points.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setOpenPointId(`point:${p._id}`)}
                  className={`w-full rounded-card border bg-card p-3.5 text-left shadow-sm transition-colors hover:bg-page ${
                    openPointId === `point:${p._id}`
                      ? "border-brand"
                      : "border-line"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-ink">
                      {p.name}
                    </span>
                    <Badge tone={p.active ? "success" : "neutral"}>
                      {p.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Package size={13} aria-hidden />
                      <Mono className="text-[12px]">{p.containerCount}</Mono>
                    </span>
                    {p.fillPct !== null ? (
                      <span className="inline-flex flex-1 items-center gap-2">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
                          <span
                            className={`block h-full rounded-full ${
                              p.fillPct >= 85
                                ? "bg-danger"
                                : p.fillPct >= 60
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${p.fillPct}%` }}
                          />
                        </span>
                        <Mono className="text-[12px]">
                          {formatPct(p.fillPct, { of100: true })}
                        </Mono>
                      </span>
                    ) : (
                      <span className="text-ink-tertiary">No containers</span>
                    )}
                  </div>
                </button>
              ))}
        </div>
        <MapCanvas
          markers={markers}
          onMarkerClick={(id) => {
            if (id.startsWith("point:")) setOpenPointId(id);
          }}
          satelliteToggle
          className="min-h-[calc(100vh-220px)] overflow-hidden rounded-card border border-line shadow-sm"
        />
      </div>

      <SidePanel
        open={openPoint !== null}
        onClose={() => setOpenPointId(null)}
        title={openPoint?.name ?? ""}
        subtitle={openPoint?.address}
      >
        {openPoint ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                  Hours
                </div>
                <Mono className="mt-0.5 block">{openPoint.hours}</Mono>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                  Listing
                </div>
                <div className="mt-1 flex gap-1.5">
                  <Badge tone={openPoint.isPublic ? "info" : "neutral"}>
                    {openPoint.isPublic ? "Public" : "Private"}
                  </Badge>
                  <Badge tone={openPoint.active ? "success" : "neutral"}>
                    {openPoint.active ? "Active" : "Paused"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-card-title mb-2">Containers on site</h3>
              {pointContainers.length === 0 ? (
                <p className="text-[13px] text-ink-secondary">
                  No containers currently at this point.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pointContainers.map((c) => (
                    <li
                      key={c._id}
                      className="flex items-center justify-between gap-2 rounded-ctl border border-line p-3 text-[13px]"
                    >
                      <Mono className="font-medium">{c.tag}</Mono>
                      <span className="flex items-center gap-3">
                        <Mono>{formatKg(c.currentMassKg)}</Mono>
                        <Mono>{formatPct(c.fillPct, { of100: true })}</Mono>
                        {c.lastTempCheckAt ? (
                          <Mono className="text-ink-tertiary">
                            {formatTimeAgo(c.lastTempCheckAt)}
                          </Mono>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-card-title mb-2">Accepted</h3>
              <ul className="list-inside list-disc text-[13px] text-ink-secondary">
                {openPoint.acceptedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-card-title mb-2">Not accepted</h3>
              <ul className="list-inside list-disc text-[13px] text-ink-secondary">
                {openPoint.prohibitedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </SidePanel>
    </div>
  );
}
