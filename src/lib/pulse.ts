import { computeFreshnessTier } from "./freshness";
import { getLatestObservation, isDatabaseConfigured, savePulseSnapshot } from "./db";
import { fetchLatestCbslFxRate } from "./integrations/cbsl";
import { fetchFloodAlertSummary } from "./integrations/flood";
import {
  buildCsePulseMetricFromSnapshot,
  buildCseSnapshot,
  CSE_SOURCE_ID,
} from "./integrations/cse";
import { buildNewsPulseMetric, fetchNewsPulse } from "./integrations/news";
import { fetchOctanePrices, pickCpcPrice } from "./integrations/octane";
import { buildPowerPulseMetric } from "./integrations/power";
import { getPropertyData } from "./integrations/propertylk";
import { getVehicleData } from "./integrations/vehicle";
import { buildWeatherPulseMetric } from "./integrations/weather";
import { formatPropertyPrice } from "./property";
import { formatVehiclePrice } from "./vehicle";
import { getSource, getSourceProvenancePath } from "./sources";
import type { FreshnessTier, PulseMetric, PulseSnapshot, SourceHealth } from "./types";

export const TODAY_METRIC_IDS = [
  "usd_lkr",
  "fuel_petrol_92",
  "fuel_diesel",
  "weather_colombo",
  "power_status",
  "flood_stations",
] as const;

export function getTodayPulseMetrics(metrics: PulseMetric[]): PulseMetric[] {
  return TODAY_METRIC_IDS.map((id) => metrics.find((metric) => metric.id === id)).filter(
    (metric): metric is PulseMetric => metric != null,
  );
}

const FX_FALLBACK_RATE = 302.5;
const FX_FALLBACK_DATE = "2026-07-18T00:00:00.000Z";
const FUEL_FALLBACK_PETROL = 414;
const FUEL_FALLBACK_DIESEL = 382;
const FUEL_FALLBACK_DATE = "2026-06-30T00:00:00.000Z";

async function buildFuelMetrics(checkedAt: string): Promise<{
  metrics: PulseMetric[];
  health: SourceHealth;
}> {
  const source = getSource("octane_fuel")!;
  try {
    const data = await fetchOctanePrices();
    const petrol92 = pickCpcPrice(data.prices, "petrol_92");
    const diesel = pickCpcPrice(data.prices, "auto_diesel");
    const observedAt = petrol92?.recorded_at ?? diesel?.recorded_at ?? null;
    const tier = computeFreshnessTier(observedAt, source.cadenceMinutes);

    const metrics: PulseMetric[] = [];
    if (petrol92) {
      metrics.push({
        id: "fuel_petrol_92",
        label: "Petrol 92",
        value: petrol92.price_lkr.toFixed(2),
        unit: "LKR/L",
        observedAt: petrol92.recorded_at,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
      });
    }
    if (diesel) {
      metrics.push({
        id: "fuel_diesel",
        label: "Auto Diesel",
        value: diesel.price_lkr.toFixed(2),
        unit: "LKR/L",
        observedAt: diesel.recorded_at,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
      });
    }

    return {
      metrics,
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: observedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier = computeFreshnessTier(FUEL_FALLBACK_DATE, source.cadenceMinutes);
    return {
      metrics: [
        {
          id: "fuel_petrol_92",
          label: "Petrol 92",
          value: FUEL_FALLBACK_PETROL.toFixed(2),
          unit: "LKR/L",
          observedAt: FUEL_FALLBACK_DATE,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "Fallback — Octane API unavailable",
        },
        {
          id: "fuel_diesel",
          label: "Auto Diesel",
          value: FUEL_FALLBACK_DIESEL.toFixed(2),
          unit: "LKR/L",
          observedAt: FUEL_FALLBACK_DATE,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "Fallback — Octane API unavailable",
        },
      ],
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: FUEL_FALLBACK_DATE,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildFloodData(checkedAt: string): Promise<{
  flood: PulseSnapshot["flood"];
  health: SourceHealth;
}> {
  const source = getSource("lk_flood_api")!;
  try {
    const flood = await fetchFloodAlertSummary();
    const tier: PulseSnapshot["sources"][number]["tier"] = "fresh";

    return {
      flood,
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: checkedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    return {
      flood: [],
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: "down",
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildFxMetric(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource("cbsl_fx")!;

  try {
    const dbObservation = await getLatestObservation(source.id, "usd_lkr_sell");
    if (dbObservation) {
      const buyObservation = await getLatestObservation(source.id, "usd_lkr_buy");
      const tier = computeFreshnessTier(
        dbObservation.observedAt,
        source.cadenceMinutes,
      );
      const note =
        buyObservation != null
          ? `Buy ${buyObservation.value.toFixed(2)} / Sell ${dbObservation.value.toFixed(2)}`
          : undefined;

      return {
        metric: {
          id: "usd_lkr",
          label: "USD / LKR",
          value: dbObservation.value.toFixed(2),
          unit: "LKR",
          observedAt: dbObservation.observedAt,
          tier,
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note,
        },
        health: {
          id: source.id,
          name: source.name,
          category: source.category,
          tier,
          lastSuccessAt: dbObservation.observedAt,
          lastCheckedAt: checkedAt,
          error: null,
          provenancePath: getSourceProvenancePath(source.id),
        },
      };
    }

    const latest = await fetchLatestCbslFxRate();
    const tier = computeFreshnessTier(latest.observedAt, source.cadenceMinutes);

    return {
      metric: {
        id: "usd_lkr",
        label: "USD / LKR",
        value: latest.sellRate.toFixed(2),
        unit: "LKR",
        observedAt: latest.observedAt,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: `Buy ${latest.buyRate.toFixed(2)} / Sell ${latest.sellRate.toFixed(2)}`,
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: latest.observedAt,
        lastCheckedAt: checkedAt,
        error: null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier = computeFreshnessTier(FX_FALLBACK_DATE, source.cadenceMinutes);

    return {
      metric: {
        id: "usd_lkr",
        label: "USD / LKR",
        value: FX_FALLBACK_RATE.toFixed(2),
        unit: "LKR",
        observedAt: FX_FALLBACK_DATE,
        tier,
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "Fallback value — CBSL scrape unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: FX_FALLBACK_DATE,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

async function buildNewsData(checkedAt: string): Promise<{
  contribution: { metric: PulseMetric; health: SourceHealth } | null;
}> {
  const source = getSource("news_rss")!;

  try {
    const pulse = await fetchNewsPulse();
    return { contribution: buildNewsPulseMetric(checkedAt, pulse) };
  } catch (error) {
    return {
      contribution: {
        metric: {
          id: "news_headlines",
          label: "Sri Lanka news",
          value: "—",
          unit: "headlines",
          observedAt: null,
          tier: "down",
          sourceId: source.id,
          provenancePath: getSourceProvenancePath(source.id),
          note: "News RSS unavailable",
        },
        health: {
          id: source.id,
          name: source.name,
          category: source.category,
          tier: "down",
          lastSuccessAt: null,
          lastCheckedAt: checkedAt,
          error: error instanceof Error ? error.message : "Unknown error",
          provenancePath: getSourceProvenancePath(source.id),
        },
      },
    };
  }
}

async function buildCseData(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource(CSE_SOURCE_ID)!;

  try {
    const snapshot = await buildCseSnapshot();
    return {
      metric: buildCsePulseMetricFromSnapshot(checkedAt, snapshot),
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: snapshot.tier,
        lastSuccessAt: snapshot.asOf,
        lastCheckedAt: checkedAt,
        error: snapshot.isFallback ? "Seed fallback — CSE API unavailable" : null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    return {
      metric: {
        id: "cse_aspi",
        label: "ASPI",
        value: "—",
        unit: "pts",
        observedAt: null,
        tier: "down",
        sourceId: source.id,
        provenancePath: getSourceProvenancePath(source.id),
        note: "CSE market data unavailable",
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier: "down",
        lastSuccessAt: null,
        lastCheckedAt: checkedAt,
        error: error instanceof Error ? error.message : "Unknown error",
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  }
}

export async function buildPulseSnapshot(): Promise<PulseSnapshot> {
  const checkedAt = new Date().toISOString();
  const [fuel, flood, fx, weather, power, news, cse, propertySnapshot, vehicleSnapshot] =
    await Promise.all([
      buildFuelMetrics(checkedAt),
      buildFloodData(checkedAt),
      buildFxMetric(checkedAt),
      buildWeatherPulseMetric(checkedAt),
      buildPowerPulseMetric(checkedAt),
      buildNewsData(checkedAt),
      buildCseData(checkedAt),
      getPropertyData(),
      getVehicleData(),
    ]);

  const normalStations =
    flood.flood.find((item) => item.alertLevel === "NORMAL")?.count ?? 0;
  const totalStations = flood.flood.reduce((sum, item) => sum + item.count, 0);

  const colomboProperty = propertySnapshot.districts.find(
    (district) => district.slug === "colombo",
  );
  const propertySource =
    getSource(propertySnapshot.sourceId) ?? getSource("propertylk_seed")!;

  const colomboVehicle = vehicleSnapshot.districts.find(
    (district) => district.slug === "colombo",
  );
  const vehicleSource =
    getSource(vehicleSnapshot.sourceId) ?? getSource("vehicle_platform_seed")!;

  const metrics: PulseMetric[] = [
    fx.metric,
    ...fuel.metrics,
    weather.metric,
    power.metric,
    cse.metric,
    ...(colomboProperty
      ? [
          {
            id: "property_colombo_median",
            label: "Colombo land (median)",
            value: formatPropertyPrice(colomboProperty.medianPerPerch),
            unit: "LKR/perch",
            observedAt: propertySnapshot.asOf,
            tier: computeFreshnessTier(
              propertySnapshot.asOf,
              propertySource.cadenceMinutes,
            ),
            sourceId: propertySource.id,
            provenancePath: getSourceProvenancePath(propertySource.id),
            note:
              propertySnapshot.sourceId === "propertylk_seed"
                ? "Seed fallback — live PropertyLK API unavailable"
                : `National median LKR ${formatPropertyPrice(
                    propertySnapshot.districts
                      .map((district) => district.medianPerPerch)
                      .sort((a, b) => a - b)[
                      Math.floor(propertySnapshot.districts.length / 2)
                    ] ?? 0,
                  )}/perch`,
          } satisfies PulseMetric,
        ]
      : []),
    ...(colomboVehicle
      ? [
          {
            id: "vehicle_colombo_median",
            label: "Colombo vehicles (median)",
            value: formatVehiclePrice(colomboVehicle.medianPriceLkr),
            unit: "LKR",
            observedAt: vehicleSnapshot.asOf,
            tier: computeFreshnessTier(
              vehicleSnapshot.asOf,
              vehicleSource.cadenceMinutes,
            ),
            sourceId: vehicleSource.id,
            provenancePath: getSourceProvenancePath(vehicleSource.id),
            note: `${vehicleSnapshot.totalListings.toLocaleString()} national listings tracked`,
          } satisfies PulseMetric,
        ]
      : []),
    {
      id: "flood_stations",
      label: "River Stations",
      value: String(totalStations),
      unit: "monitoring",
      observedAt: flood.health.lastSuccessAt,
      tier: flood.health.tier,
      sourceId: flood.health.id,
      provenancePath: flood.health.provenancePath,
      note: `${normalStations} stations reporting normal levels`,
    },
    ...(news.contribution ? [news.contribution.metric] : []),
  ];

  const snapshot: PulseSnapshot = {
    generatedAt: checkedAt,
    metrics,
    flood: flood.flood,
    sources: [
      fx.health,
      fuel.health,
      flood.health,
      weather.health,
      power.health,
      cse.health,
      ...(news.contribution ? [news.contribution.health] : []),
    ],
  };

  if (isDatabaseConfigured()) {
    savePulseSnapshot(snapshot).catch(() => {
      // Non-blocking persistence
    });
  }

  return snapshot;
}

export async function buildHealthSnapshot(): Promise<SourceHealth[]> {
  const snapshot = await buildPulseSnapshot();
  return snapshot.sources;
}
