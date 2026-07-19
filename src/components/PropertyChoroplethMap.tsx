"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTranslations, useLocale } from "next-intl";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import { districtSlugFromName, districtSlugFromPcode } from "@/lib/district-geo";
import {
  formatPropertyPrice,
  getMaxPropertyMedian,
  getPropertyDistrictPrice,
  getPropertyPriceColor,
} from "@/lib/property";

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

export function PropertyChoroplethMap({ height = 420 }: { height?: number }) {
  const t = useTranslations("property");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxMedian = getMaxPropertyMedian();

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
          const price = slug ? getPropertyDistrictPrice(slug) : undefined;
          const district = slug
            ? DISTRICTS.find((item) => item.slug === slug)
            : undefined;

          if (price && district) {
            feature.properties.fillColor = getPropertyPriceColor(
              price.medianPerPerch,
              maxMedian,
            );
            feature.properties.tooltipValue = `${getDistrictName(district, locale)}: LKR ${formatPropertyPrice(price.medianPerPerch)}/${t("perchUnit")}`;
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
  }, [locale, maxMedian, t]);

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
