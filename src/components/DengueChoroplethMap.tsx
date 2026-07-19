"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations, useLocale } from "next-intl";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import { getDengueSnapshot, getMaxDengueCases } from "@/lib/health";
import { DengueDistrictTable } from "./DengueDistrictTable";
import type { DengueDistrictStat } from "@/lib/types";

interface DistrictFeatureProperties {
  slug?: string;
  ADM2_EN?: string;
  ADM2_PCODE?: string;
  fillColor?: string;
  tooltipValue?: string;
}

interface DistrictFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: DistrictFeatureProperties;
    geometry: GeoJSON.Geometry;
  }>;
}

function resolveSlug(properties: DistrictFeatureProperties): string | null {
  if (properties.slug) {
    return properties.slug;
  }
  return (
    districtSlugFromPcode(properties.ADM2_PCODE) ??
    districtSlugFromName(properties.ADM2_EN)
  );
}

function dengueCaseColor(cases: number, maxCases: number): string {
  const ratio = cases / maxCases;
  if (ratio >= 0.75) {
    return "#dc2626";
  }
  if (ratio >= 0.5) {
    return "#f87171";
  }
  if (ratio >= 0.3) {
    return "#fbbf24";
  }
  if (ratio >= 0.15) {
    return "#34d399";
  }
  return "#134e4a";
}

export function DengueChoroplethMap({ height = 420 }: { height?: number }) {
  const t = useTranslations("health");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const snapshot = getDengueSnapshot();
  const maxCases = getMaxDengueCases();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;

    async function initMap() {
      try {
        const response = await fetch("/geo/districts.geojson");
        if (!response.ok) {
          throw new Error("Failed to load district boundaries");
        }
        const geojson = (await response.json()) as DistrictFeatureCollection;

        for (const feature of geojson.features) {
          const slug = resolveSlug(feature.properties);
          const stat = slug
            ? snapshot.districts.find((item) => item.slug === slug)
            : undefined;
          const district = slug
            ? DISTRICTS.find((item) => item.slug === slug)
            : undefined;

          if (stat && district) {
            feature.properties.fillColor = dengueCaseColor(stat.cases, maxCases);
            feature.properties.tooltipValue = `${getDistrictName(district, locale)}: ${stat.cases.toLocaleString()} ${t("cases")}`;
            feature.properties.slug = slug ?? undefined;
          } else {
            feature.properties.fillColor = "#334155";
          }
        }

        if (cancelled || !containerRef.current) {
          return;
        }

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              districts: {
                type: "geojson",
                data: geojson,
                promoteId: "slug",
              },
            },
            layers: [
              {
                id: "district-fill",
                type: "fill",
                source: "districts",
                paint: {
                  "fill-color": ["get", "fillColor"],
                  "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    0.75,
                    0.45,
                  ],
                },
              },
              {
                id: "district-outline",
                type: "line",
                source: "districts",
                paint: {
                  "line-color": "#5eead4",
                  "line-width": 1,
                },
              },
            ],
          },
          bounds: [
            [79.5, 5.9],
            [82.1, 9.9],
          ],
          fitBoundsOptions: { padding: 24 },
          attributionControl: false,
        });

        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();

        mapRef.current = map;
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: "district-map-popup",
        });

        let hoveredId: string | number | undefined;

        map.on("mousemove", "district-fill", (event) => {
          map.getCanvas().style.cursor = "pointer";
          if (event.features?.length) {
            const feature = event.features[0];
            const featureId = feature.id;
            const properties = feature.properties as DistrictFeatureProperties;

            if (featureId == null || hoveredId === featureId) {
              return;
            }
            if (hoveredId != null) {
              map.setFeatureState(
                { source: "districts", id: hoveredId },
                { hover: false },
              );
            }
            hoveredId = featureId;
            map.setFeatureState(
              { source: "districts", id: hoveredId },
              { hover: true },
            );

            if (properties.tooltipValue && popupRef.current) {
              popupRef.current
                .setLngLat(event.lngLat)
                .setHTML(
                  `<div class="text-sm font-medium">${properties.tooltipValue}</div>`,
                )
                .addTo(map);
            }
          }
        });

        map.on("mouseleave", "district-fill", () => {
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
          if (hoveredId != null) {
            map.setFeatureState(
              { source: "districts", id: hoveredId },
              { hover: false },
            );
          }
          hoveredId = undefined;
        });
      } catch (initError) {
        if (!cancelled) {
          setError(
            initError instanceof Error ? initError.message : t("mapError"),
          );
        }
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      popupRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locale, maxCases, snapshot.districts, t]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
      <div ref={containerRef} style={{ height }} className="w-full" />
    </div>
  );
}

export function HealthViewToggle({
  locale,
  districts,
}: {
  locale: string;
  districts: DengueDistrictStat[];
}) {
  const t = useTranslations("health");
  const [view, setView] = useState<"table" | "map">("table");

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t("districtTableTitle")}
          </h2>
          <p className="text-sm text-slate-400">{t("districtTableSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              view === "table"
                ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            {t("viewTable")}
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              view === "map"
                ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            {t("viewMap")}
          </button>
        </div>
      </div>

      {view === "table" ? (
        <DengueDistrictTable districts={districts} locale={locale} />
      ) : (
        <>
          <DengueChoroplethMap />
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
              {t("mapLegendHigh")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-400" />
              {t("mapLegendModerate")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
              {t("mapLegendLow")}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
