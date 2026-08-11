"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapTrifold } from "@phosphor-icons/react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  /** Semantic tone; resolved to token colours. */
  tone?: "brand" | "info" | "danger";
  label?: string;
};

// One Mapbox wrapper for every map surface. Renders an explicit configuration
// notice when no token is present — never a broken tile grid.
export function MapCanvas({
  markers,
  onMarkerClick,
  className = "",
  satelliteToggle = false,
}: {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  satelliteToggle?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerObjs = useRef<mapboxgl.Marker[]>([]);
  const styleRef = useRef<"map" | "satellite">("map");

  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [36.82, -1.29],
      zoom: 11,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];
    const styles = getComputedStyle(document.documentElement);
    const toneColor = {
      brand: styles.getPropertyValue("--brand").trim(),
      info: styles.getPropertyValue("--info").trim(),
      danger: styles.getPropertyValue("--danger").trim(),
    };
    const bounds = new mapboxgl.LngLatBounds();
    for (const marker of markers) {
      const el = document.createElement("button");
      el.setAttribute("aria-label", marker.label ?? marker.id);
      el.style.cssText = `width:14px;height:14px;border-radius:50%;border:2.5px solid ${styles
        .getPropertyValue("--card")
        .trim()};background:${toneColor[marker.tone ?? "brand"]};box-shadow:var(--shadow-md);cursor:pointer;`;
      if (onMarkerClick) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick(marker.id);
        });
      }
      const obj = new mapboxgl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
      markerObjs.current.push(obj);
      bounds.extend([marker.lng, marker.lat]);
    }
    if (markers.length > 1) {
      map.fitBounds(bounds, { padding: 64, maxZoom: 13, duration: 300 });
    }
  }, [markers, onMarkerClick]);

  if (!TOKEN) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-raised text-center ${className}`}
      >
        <MapTrifold size={28} className="text-ink-tertiary" aria-hidden />
        <div className="text-card-title">Map unavailable</div>
        <p className="max-w-xs text-[13px] text-ink-secondary">
          Set <span className="mono">NEXT_PUBLIC_MAPBOX_TOKEN</span> in{" "}
          <span className="mono">.env.local</span> to enable the basemap. Site
          data is still listed beside the map.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {satelliteToggle ? (
        <div className="absolute bottom-4 right-4 flex overflow-hidden rounded-ctl border border-line bg-card shadow-sm">
          {(["satellite", "map"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                const map = mapRef.current;
                if (!map || styleRef.current === (mode === "map" ? "map" : "satellite")) return;
                styleRef.current = mode === "map" ? "map" : "satellite";
                map.setStyle(
                  mode === "map"
                    ? "mapbox://styles/mapbox/light-v11"
                    : "mapbox://styles/mapbox/satellite-streets-v12",
                );
              }}
              className="h-9 px-3 text-[13px] font-medium text-ink-secondary hover:bg-raised"
            >
              {mode === "satellite" ? "Satellite View" : "Map View"}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
