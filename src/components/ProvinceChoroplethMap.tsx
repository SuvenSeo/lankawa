"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations, useLocale } from "next-intl";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import {
  getCandidateColor,
  getElectionDistrictResult,
  getParliamentaryDistrictForAdminDistrict,
  getPartyColor,
} from "@/lib/elections";
import { getPopulationDensity } from "@/lib/district-stats";
import type { District } from "@/lib/types";

export type ChoroplethMode = "density" | "presidential" | "parliamentary";

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

function densityColor(density: number): string {
  if (density >= 2000) {
    return "#0f766e";
  }
  if (density >= 1000) {
    return "#14b8a6";
  }
  if (density >= 500) {
    return "#2dd4bf";
  }
  if (density >= 200) {
    return "#5eead4";
  }
  if (density >= 100) {
    return "#99f6e4";
  }
  return "#134e4a";
}

function computeFillForDistrict(
  district: District,
  mode: ChoroplethMode,
  locale: string,
): { color: string; tooltip: string } {
  switch (mode) {
    case "density": {
      const density = getPopulationDensity(district);
      return {
        color: densityColor(density),
        tooltip: `${getDistrictName(district, locale)}: ${density.toLocaleString()} /km²`,
      };
    }
    case "presidential": {
      const result = getElectionDistrictResult(district.slug);
      if (!result) {
        return { color: "#334155", tooltip: getDistrictName(district, locale) };
      }
      const share =
        (result.results[result.winner] / result.validVotes) * 100;
      return {
        color: getCandidateColor(result.winner),
        tooltip: `${getDistrictName(district, locale)}: ${result.winner.toUpperCase()} ${share.toFixed(1)}%`,
      };
    }
    case "parliamentary": {
      const result = getParliamentaryDistrictForAdminDistrict(district.slug);
      if (!result) {
        return { color: "#334155", tooltip: getDistrictName(district, locale) };
      }
      const share =
        (result.seats[result.winner] / result.totalSeats) * 100;
      return {
        color: getPartyColor(result.winner),
        tooltip: `${getDistrictName(district, locale)}: ${result.winner.toUpperCase()} ${share.toFixed(0)}% seats`,
      };
    }
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export function ProvinceChoroplethMap({
  provinceDistrictSlugs,
  mode,
  height = 360,
}: {
  provinceDistrictSlugs?: string[];
  mode: ChoroplethMode;
  height?: number;
}) {
  const t = useTranslations("provinces");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          const district = slug
            ? DISTRICTS.find((item) => item.slug === slug)
            : undefined;
          if (district) {
            const { color, tooltip } = computeFillForDistrict(
              district,
              mode,
              locale,
            );
            feature.properties.fillColor = color;
            feature.properties.tooltipValue = tooltip;
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

        if (provinceDistrictSlugs?.length) {
          map.on("load", () => {
            for (const slug of provinceDistrictSlugs) {
              map.setFeatureState(
                { source: "districts", id: slug },
                { hover: true },
              );
            }
          });
        }
      } catch (initError) {
        if (!cancelled) {
          setError(
            initError instanceof Error
              ? initError.message
              : t("mapError"),
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
  }, [locale, mode, provinceDistrictSlugs, t]);

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

export function ChoroplethModeTabs({
  mode,
  onModeChange,
}: {
  mode: ChoroplethMode;
  onModeChange: (mode: ChoroplethMode) => void;
}) {
  const t = useTranslations("provinces");
  const modes: ChoroplethMode[] = ["density", "presidential", "parliamentary"];

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onModeChange(item)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            mode === item
              ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
              : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
          }`}
        >
          {t(`mapMode_${item}`)}
        </button>
      ))}
    </div>
  );
}
