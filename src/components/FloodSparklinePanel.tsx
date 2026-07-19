"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import type { FreshnessTier } from "@/lib/types";

interface HistoryPoint {
  timestamp: string;
  waterLevel: number;
}

function Sparkline({ points }: { points: HistoryPoint[] }) {
  if (points.length < 2) {
    return null;
  }

  const levels = points.map((point) => point.waterLevel);
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const range = max - min || 1;
  const width = 120;
  const height = 32;

  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.waterLevel - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-[120px]"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-teal-400"
      />
    </svg>
  );
}

export function FloodSparklinePanel({
  stationNames,
}: {
  stationNames: string[];
}) {
  const t = useTranslations("flood");
  const hasStations = stationNames.length > 0;
  const [stations, setStations] = useState<
    Array<{
      name: string;
      points: HistoryPoint[];
      tier: FreshnessTier;
      error?: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(hasStations);

  useEffect(() => {
    if (!hasStations) {
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      const results = await Promise.all(
        stationNames.map(async (name) => {
          try {
            const response = await fetch(
              `/api/v1/flood/history?station=${encodeURIComponent(name)}&limit=24`,
            );
            if (!response.ok) {
              throw new Error("fetch failed");
            }
            const data = (await response.json()) as {
              points: HistoryPoint[];
              tier: FreshnessTier;
            };
            return { name, points: data.points, tier: data.tier };
          } catch {
            return {
              name,
              points: [] as HistoryPoint[],
              tier: "down" as FreshnessTier,
              error: true,
            };
          }
        }),
      );

      if (!cancelled) {
        setStations(results);
        setLoading(false);
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [hasStations, stationNames]);

  if (!hasStations) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">{t("historyTitle")}</h2>
      <p className="mt-1 text-sm text-slate-400">{t("historySubtitle")}</p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">{t("loading")}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stations.map((station) => (
            <article
              key={station.name}
              className="rounded-xl border border-white/10 bg-slate-950/40 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">{station.name}</p>
                <FreshnessBadge tier={station.tier} />
              </div>
              {station.error || station.points.length < 2 ? (
                <p className="mt-2 text-xs text-slate-500">{t("unavailable")}</p>
              ) : (
                <div className="mt-2 flex items-end justify-between gap-2">
                  <Sparkline points={station.points} />
                  <span className="text-xs text-slate-400">
                    {station.points[station.points.length - 1]?.waterLevel.toFixed(2)} m
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
