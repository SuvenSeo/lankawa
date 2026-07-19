import { getDistrictForFloodStation } from "../flood-districts";
import type { FloodAlertSummary, FloodStationLevel } from "../types";

const FLOOD_API_BASE =
  process.env.FLOOD_API_BASE ?? "https://lk-flood-api.vercel.app";

export async function fetchFloodAlertSummary(): Promise<FloodAlertSummary[]> {
  const response = await fetch(`${FLOOD_API_BASE}/alerts/summary`, {
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    alert_level?: string;
    alertLevel?: string;
    count: number;
    stations: string[];
  }>;

  return raw.map((item) => ({
    alertLevel: item.alertLevel ?? item.alert_level ?? "UNKNOWN",
    count: item.count,
    stations: item.stations,
  }));
}

export async function fetchFloodHealth(): Promise<{ status: string }> {
  const response = await fetch(`${FLOOD_API_BASE}/health`, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API health returned ${response.status}`);
  }

  return response.json() as Promise<{ status: string }>;
}

export async function fetchLatestFloodLevels(): Promise<FloodStationLevel[]> {
  const response = await fetch(`${FLOOD_API_BASE}/levels/latest`, {
    next: { revalidate: 600 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Flood API levels returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    station_name?: string;
    stationName?: string;
    river_name?: string;
    riverName?: string;
    water_level?: number;
    waterLevel?: number;
    alert_status?: string;
    alertStatus?: string;
    remarks?: string;
    timestamp?: string;
  }>;

  return raw.map((item) => ({
    stationName: item.stationName ?? item.station_name ?? "Unknown",
    riverName: item.riverName ?? item.river_name ?? "",
    waterLevel: item.waterLevel ?? item.water_level ?? 0,
    alertStatus: item.alertStatus ?? item.alert_status ?? "UNKNOWN",
    remarks: item.remarks ?? "",
    timestamp: item.timestamp ?? "",
  }));
}

export async function fetchFloodLevelsForDistrict(
  districtSlug: string,
): Promise<FloodStationLevel[]> {
  const levels = await fetchLatestFloodLevels();
  return levels.filter(
    (level) => getDistrictForFloodStation(level.stationName) === districtSlug,
  );
}

export interface FloodHistoryPoint {
  timestamp: string;
  waterLevel: number;
}

export async function fetchFloodLevelHistory(
  stationName: string,
  limit = 24,
): Promise<{ points: FloodHistoryPoint[]; tier: "fresh" | "stale" | "down" }> {
  const response = await fetch(
    `${FLOOD_API_BASE}/levels/history/${encodeURIComponent(stationName)}?limit=${limit}`,
    {
      next: { revalidate: 600 },
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Flood history returned ${response.status}`);
  }

  const raw = (await response.json()) as Array<{
    timestamp?: string;
    water_level?: number;
    waterLevel?: number;
  }>;

  const points = raw
    .map((item) => ({
      timestamp: item.timestamp ?? "",
      waterLevel: item.waterLevel ?? item.water_level ?? 0,
    }))
    .reverse();

  const latest = points[points.length - 1]?.timestamp;
  let tier: "fresh" | "stale" | "down" = "fresh";
  if (latest) {
    const ageMs = Date.now() - new Date(latest).getTime();
    if (ageMs > 6 * 60 * 60 * 1000) {
      tier = "stale";
    }
  } else {
    tier = "down";
  }

  return { points, tier };
}
