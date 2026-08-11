"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  CalendarCheck,
  MapPin,
  NavigationArrow,
  Package,
} from "@phosphor-icons/react";
import { Badge, Button, EmptyState, Mono, Skeleton } from "@/app/components/ui";
import { COLLECTION_TONE, formatPct } from "@/lib/format";

export default function FieldToday() {
  const stops = useQuery(api.collections.todayStops, {});
  const markArrived = useMutation(api.collections.markArrived);

  return (
    <div>
      <h1 className="text-page-title mb-1">Today&apos;s stops</h1>
      <p className="mb-4 text-[13px] text-ink-secondary">
        Work top to bottom — the route is already ordered.
      </p>

      {stops === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : stops.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No stops today"
          body="Scheduled collections for today will appear here as large cards."
        />
      ) : (
        <ul className="space-y-3">
          {stops.map((stop) => (
            <li
              key={stop._id}
              className="rounded-card border border-line bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-brand" aria-hidden />
                    <span className="truncate text-[15px] font-semibold text-ink">
                      {stop.site}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate pl-6 text-[12px] text-ink-secondary">
                    {stop.address}
                  </div>
                </div>
                <Badge tone={COLLECTION_TONE[stop.status] ?? "neutral"}>
                  {stop.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
                <div className="rounded-ctl bg-raised p-2">
                  <div className="text-ink-tertiary">Container</div>
                  <Mono className="mt-0.5 block text-[13px] font-medium">
                    <Package size={12} className="mr-1 inline" aria-hidden />
                    {stop.container}
                  </Mono>
                </div>
                <div className="rounded-ctl bg-raised p-2">
                  <div className="text-ink-tertiary">Expected fill</div>
                  <Mono className="mt-0.5 block text-[13px] font-medium">
                    {formatPct(stop.expectedFillPct, { of100: true })}
                  </Mono>
                </div>
                <div className="rounded-ctl bg-raised p-2">
                  <div className="text-ink-tertiary">Distance</div>
                  <Mono className="mt-0.5 block text-[13px] font-medium">
                    {stop.distanceKm !== null ? `${stop.distanceKm} km` : "—"}
                  </Mono>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {stop.status === "arrived" || stop.status === "collected" ? (
                  <Link
                    href={`/field/collect/${stop.containerId}`}
                    className="flex h-12 flex-1 items-center justify-center rounded-ctl bg-brand text-[14px] font-medium text-white hover:bg-brand-hover"
                  >
                    {stop.status === "collected" ? "View collection" : "Start collection"}
                  </Link>
                ) : (
                  <>
                    <a
                      href={
                        stop.lat !== null && stop.lng !== null
                          ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`
                          : "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-ctl bg-brand text-[14px] font-medium text-white hover:bg-brand-hover"
                    >
                      <NavigationArrow size={16} aria-hidden />
                      Navigate
                    </a>
                    <Button
                      variant="secondary"
                      className="h-12 flex-1 justify-center text-[14px]"
                      onClick={() => void markArrived({ collectionId: stop._id })}
                    >
                      Arrived
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
