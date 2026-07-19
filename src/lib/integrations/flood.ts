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
