"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@convex/_generated/api";
import {
  CheckCircle,
  Image as ImageIcon,
  MapPin,
  NavigationArrow,
  Prohibit,
} from "@phosphor-icons/react";
import { PublicChrome } from "@/app/components/public-chrome";
import { MapCanvas, type MapMarker } from "@/app/components/map-canvas";
import { SidePanel } from "@/app/components/side-panel";
import { Mono, Skeleton } from "@/app/components/ui";

type Point = FunctionReturnType<typeof api.points.listPublicPoints>[number];

function DropOffContent() {
  const points = useQuery(api.points.listPublicPoints, {});
  const [openId, setOpenId] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(
    () =>
      (points ?? []).map((p) => ({
        id: p._id,
        lat: p.lat,
        lng: p.lng,
        tone: "brand" as const,
        label: p.name,
      })),
    [points],
  );

  const openPoint: Point | null =
    points?.find((p) => p._id === openId) ?? null;

  return (
    <div>
      <h1 className="text-page-title mb-1">Find a drop-off point</h1>
      <p className="mb-5 text-[13px] text-ink-secondary">
        Bring used batteries to any point below — free, no appointment needed.
      </p>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1">
          {points === undefined
            ? Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-20" />
              ))
            : points.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => setOpenId(p._id)}
                  className={`w-full rounded-card border bg-card p-4 text-left shadow-sm transition-colors hover:bg-page ${
                    openId === p._id ? "border-brand" : "border-line"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-brand" aria-hidden />
                    <span className="truncate text-[14px] font-medium text-ink">
                      {p.name}
                    </span>
                  </div>
                  <div className="mt-1 truncate pl-6 text-[12px] text-ink-secondary">
                    {p.address}
                  </div>
                  <Mono className="mt-1 block pl-6 text-[12px] text-ink-tertiary">
                    {p.hours}
                  </Mono>
                </button>
              ))}
        </div>
        <MapCanvas
          markers={markers}
          onMarkerClick={setOpenId}
          satelliteToggle
          className="min-h-[calc(100vh-220px)] overflow-hidden rounded-card border border-line shadow-sm"
        />
      </div>

      <SidePanel
        open={openPoint !== null}
        onClose={() => setOpenId(null)}
        title={openPoint?.name ?? ""}
        subtitle={openPoint?.address}
        footer={
          openPoint ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${openPoint.lat},${openPoint.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center justify-center gap-1.5 rounded-ctl bg-brand text-[13px] font-medium text-white hover:bg-brand-hover"
            >
              <NavigationArrow size={16} aria-hidden />
              Directions
            </a>
          ) : undefined
        }
      >
        {openPoint ? (
          <div className="space-y-5">
            {openPoint.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={openPoint.photoUrl}
                alt={`Photo of ${openPoint.name}`}
                className="h-40 w-full rounded-ctl object-cover"
              />
            ) : (
              <div className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-ctl bg-raised text-ink-tertiary">
                <ImageIcon size={24} aria-hidden />
                <span className="text-[12px]">No photo yet</span>
              </div>
            )}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-tertiary">
                Opening hours
              </div>
              <Mono className="mt-1 block">{openPoint.hours}</Mono>
            </div>
            <div>
              <h3 className="text-card-title mb-2 flex items-center gap-1.5">
                <CheckCircle size={16} className="text-success" aria-hidden />
                Accepted
              </h3>
              <ul className="space-y-1 text-[13px] text-ink-secondary">
                {openPoint.acceptedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-card-title mb-2 flex items-center gap-1.5">
                <Prohibit size={16} className="text-danger" aria-hidden />
                Not accepted
              </h3>
              <ul className="space-y-1 text-[13px] text-ink-secondary">
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

export default function FindDropOff() {
  return (
    <PublicChrome>
      <DropOffContent />
    </PublicChrome>
  );
}
