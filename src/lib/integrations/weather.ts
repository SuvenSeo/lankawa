import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier, PulseMetric, SourceHealth } from "../types";

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=6.9271&longitude=79.8612&current=temperature_2m,weather_code,precipitation&timezone=Asia/Colombo";

export interface ColomboWeather {
  temp: number;
  label: string;
  precipitation: number;
  observedAt: string;
}

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    weather_code?: number;
    precipitation?: number;
  };
}

/** WMO weather interpretation codes → short English labels. */
export function wmoCodeToLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export async function fetchColomboWeather(): Promise<ColomboWeather> {
  const response = await fetch(OPEN_METEO_URL, {
    next: { revalidate: 1800 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo returned ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current;

  if (
    current?.temperature_2m == null ||
    current.weather_code == null ||
    current.precipitation == null
  ) {
    throw new Error("Open-Meteo response missing current weather fields");
  }

  return {
    temp: current.temperature_2m,
    label: wmoCodeToLabel(current.weather_code),
    precipitation: current.precipitation,
    observedAt: current.time ?? new Date().toISOString(),
  };
}

export async function buildWeatherPulseMetric(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource("open_meteo")!;

  try {
    const weather = await fetchColomboWeather();
    const tier = computeFreshnessTier(weather.observedAt, source.cadenceMinutes);

    return {
      metric: {
        id: "weather_colombo",
        label: "Colombo weather",
        value: weather.temp.toFixed(1),
        unit: "°C",
        observedAt: weather.observedAt,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: `${weather.label}${weather.precipitation > 0 ? ` · ${weather.precipitation.toFixed(1)} mm` : ""}`,
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: weather.observedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier: FreshnessTier = "down";

    return {
      metric: {
        id: "weather_colombo",
        label: "Colombo weather",
        value: "—",
        unit: "°C",
        observedAt: null,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "Open-Meteo unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}
