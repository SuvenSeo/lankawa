import type { SourceCategory, SourceDefinition } from "./types";

export const SOURCES: SourceDefinition[] = [
  {
    id: "octane_fuel",
    name: "Octane Fuel API",
    category: "transport",
    url: "https://octane-api.fly.dev",
    cadenceMinutes: 10080,
    adapter: "partner",
    description:
      "Weekly CPC fuel price updates for petrol and diesel across Sri Lanka.",
    methodology:
      "Lankawa ingests partner fuel price records on a weekly cadence. Prices are normalized to LKR per litre for petrol 92 and auto diesel, tagged with the observation timestamp, and surfaced on the home pulse and economy pages.",
    metrics: ["fuel_petrol_92", "fuel_diesel"],
  },
  {
    id: "lk_flood_api",
    name: "Sri Lanka Flood API",
    category: "disaster",
    url: "https://lk-flood-api.vercel.app",
    cadenceMinutes: 10,
    adapter: "api",
    description:
      "River station flood alert levels aggregated for national monitoring.",
    methodology:
      "Lankawa polls river station alert levels every few minutes, groups stations by alert level (NORMAL, WATCH, etc.), and displays counts on the pulse, disaster page, and source health dashboard.",
    metrics: ["flood_stations"],
  },
  {
    id: "cbsl_fx",
    name: "Central Bank of Sri Lanka",
    category: "economy",
    url: "https://www.cbsl.gov.lk",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Official USD/LKR buy and sell exchange rates published by CBSL.",
    methodology:
      "Lankawa retrieves the latest USD/LKR buy and sell rates daily. A scheduled ingest job persists observations; the pulse layer falls back to a live scrape or cached value if the database is unavailable.",
    metrics: ["usd_lkr"],
  },
  {
    id: "election_commission_2024",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "https://results.elections.gov.lk/pre2024/",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Presidential election 2024 district-level first-preference results.",
    methodology:
      "Lankawa ingested official 2024 presidential district results as a static seed dataset. Full results tables and maps are available on the elections pages without linking to external result portals.",
    metrics: ["presidential_2024"],
  },
  {
    id: "election_commission_pe_2024",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "https://results.elections.gov.lk/allisland.php",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Parliamentary general election 2024 district seat allocations.",
    methodology:
      "Lankawa ingested official 2024 parliamentary district seat results as a static seed dataset. Seat breakdowns are available on the elections pages without linking to external result portals.",
    metrics: ["parliamentary_2024"],
  },
  {
    id: "cbsl_macro",
    name: "Central Bank of Sri Lanka",
    category: "economy",
    url: "https://www.cbsl.gov.lk",
    cadenceMinutes: 43200,
    adapter: "scrape",
    description:
      "Macroeconomic indicators including inflation, GDP growth, and foreign reserves.",
    methodology:
      "Key macro indicators are maintained as a curated static seed from CBSL public releases. USD/LKR historical series uses live CBSL scrape when available, with a 30-day static fallback.",
    metrics: ["inflation_ccpi", "gdp_growth", "forex_reserves", "usd_lkr_series"],
  },
  {
    id: "public_services_stub",
    name: "Lankawa Public Services Directory",
    category: "civic",
    url: "internal://services",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Hospitals, MOH offices, police stations, schools, and GN offices indexed by district (seed data).",
    methodology:
      "A curated seed directory covers representative facilities across all 25 districts — typically 6+ facilities per district (hospital, divisional hospital, MOH, police, school, GN) until official open-data feeds are integrated.",
    metrics: ["public_services"],
  },
  {
    id: "budget_verite_seed",
    name: "Verité Research / Budget Speech summaries",
    category: "economy",
    url: "internal://budget",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "National budget appropriations by ministry and sector for FY 2024/25 and 2025/26.",
    methodology:
      "Curated static seed aligned with published budget speech totals and Verité Research sector summaries. Figures are rounded approximations — not digitized official appropriation ledgers.",
    metrics: ["budget_expenditure", "budget_revenue"],
  },
  {
    id: "epidemiology_unit_seed",
    name: "Epidemiology Unit — Weekly Dengue Report",
    category: "health",
    url: "internal://health",
    cadenceMinutes: 10080,
    adapter: "scrape",
    description:
      "Weekly dengue case counts by administrative district.",
    methodology:
      "Representative district-level seed data patterned on Epidemiology Unit weekly report formats. Not live scraped — updated manually until ingest pipeline is approved.",
    metrics: ["dengue_weekly"],
  },
  {
    id: "manthri_inspired_seed",
    name: "Parliamentary records (seed)",
    category: "civic",
    url: "internal://civic",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Sample MP attendance and legislative activity scorecards.",
    methodology:
      "Illustrative seed inspired by Manthri.lk patterns. Not scraped from Manthri — representative sample members for demo purposes only.",
    metrics: ["mp_attendance", "mp_bills"],
  },
  {
    id: "egp_procurement_seed",
    name: "Government Procurement — e-GP notices",
    category: "civic",
    url: "internal://tenders",
    cadenceMinutes: 1440,
    adapter: "scrape",
    description:
      "Sample government procurement tender notices with district filters.",
    methodology:
      "Static seed notices modeled on e-GP publication formats. Not live from e-GP portal — for demonstration and API testing only.",
    metrics: ["tenders"],
  },
  {
    id: "propertylk_api",
    name: "PropertyLK Price Intelligence (live)",
    category: "civic",
    url: "internal://property",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District-level median land and property price bands from the PropertyLK partner API.",
    methodology:
      "Server-side fetch from the PropertyLK production API (`/api/v1/districts`). When the upstream times out or returns empty data, Lankawa falls back to the static seed dataset and surfaces seed provenance on the property page and pulse.",
    metrics: ["property_median_per_perch"],
  },
  {
    id: "propertylk_seed",
    name: "PropertyLK Price Intelligence",
    category: "civic",
    url: "internal://property",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District-level median land and property price bands across Sri Lanka.",
    methodology:
      "Representative seed data aligned with PropertyLK price intelligence patterns. Used when the live partner API is unavailable — the property page and pulse show an explicit seed fallback notice.",
    metrics: ["property_median_per_perch"],
  },
  {
    id: "vehicle_platform_api",
    name: "AutoLens LK Vehicle Intelligence (live)",
    category: "transport",
    url: "internal://vehicles",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Used vehicle listing medians, popular makes, and district price bands from the Vehicle Platform API.",
    methodology:
      "Server-side fetch from `/api/v1/stats/summary`, `/stats/district-prices`, and `/listings/makes`. District names are mapped to Lankawa slugs. Falls back to seed when upstream is unavailable.",
    metrics: ["vehicle_median_price", "vehicle_listings"],
  },
  {
    id: "vehicle_platform_seed",
    name: "AutoLens LK Vehicle Intelligence",
    category: "transport",
    url: "internal://vehicles",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Representative used vehicle market bands by district and popular makes.",
    methodology:
      "Static seed aligned with AutoLens LK market snapshots. Used when the live Vehicle Platform API is unavailable.",
    metrics: ["vehicle_median_price", "vehicle_listings"],
  },
  {
    id: "food_platform_api",
    name: "FoodLK Price Intelligence (live)",
    category: "economy",
    url: "internal://food",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Staple food prices, essentials basket, and district meal-cost bands.",
    methodology:
      "Attempts direct FoodLK API endpoints (`/stats/summary`, `/categories/summary`, `/home/summary`). When those fail, tries the Life Platform food domain from `/life/overview`. Falls back to seed district meal costs derived from the cost-of-living model.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "food_platform_seed",
    name: "FoodLK Price Intelligence",
    category: "economy",
    url: "internal://food",
    cadenceMinutes: 86400,
    adapter: "partner",
    description:
      "Staple food prices and district meal-cost estimates for cost-of-living enrichment.",
    methodology:
      "Representative seed from FoodLK / Life Platform patterns. District monthly baskets align with the Lankawa cost-of-living seed. Used when live FoodLK endpoints return errors.",
    metrics: ["food_basket_estimate", "staple_prices"],
  },
  {
    id: "life_platform_api",
    name: "Ariva Life Platform (live)",
    category: "economy",
    url: "internal://ardeno",
    cadenceMinutes: 3600,
    adapter: "partner",
    description:
      "Unified living-cost orchestrator across food, fuel, property, and vehicles.",
    methodology:
      "Server-side fetch from `/api/v1/life/overview` on the Life Platform backend. Powers the Ardeno stack hub with domain health and headline metrics. Falls back to a constructed seed overview when unavailable.",
    metrics: ["life_overview", "domain_health"],
  },
  {
    id: "life_platform_seed",
    name: "Ariva Life Platform",
    category: "economy",
    url: "internal://ardeno",
    cadenceMinutes: 3600,
    adapter: "partner",
    description:
      "Seed overview for the Ardeno living-cost stack when the Life Platform API is unavailable.",
    methodology:
      "Static domain summaries referencing Octane, PropertyLK, AutoLens LK, and FoodLK seed modules. Internal links only — no external UI navigation.",
    metrics: ["life_overview"],
  },
  {
    id: "local_government_seed",
    name: "Department of Local Government — Directory",
    category: "civic",
    url: "internal://local-government",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description:
      "Municipal councils, urban councils, and Pradeshiya Sabhas indexed by district.",
    methodology:
      "Curated seed directory covering 327 local bodies across all 25 districts. Not exhaustive — representative breadth until official open-data feeds are integrated.",
    metrics: ["local_government_bodies"],
  },
  {
    id: "election_commission_2010",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2010 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. District figures are approximations aligned with national totals.",
    metrics: ["presidential_2010"],
  },
  {
    id: "election_commission_2015",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2015 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. District figures are approximations aligned with national totals.",
    metrics: ["presidential_2015"],
  },
  {
    id: "transport_directory_seed",
    name: "Lankawa Transport Directory",
    category: "transport",
    url: "internal://transport",
    cadenceMinutes: 525600,
    adapter: "partner",
    description:
      "Major intercity bus routes, railway stations, and airports indexed by district.",
    methodology:
      "Static seed directory covering representative SLTB routes, SLR stations, and civil airports. No GTFS feed available for Sri Lanka.",
    metrics: ["bus_routes", "railway_stations", "airports"],
  },
  {
    id: "cost_of_living_seed",
    name: "Lankawa Cost of Living Index",
    category: "economy",
    url: "internal://cost-of-living",
    cadenceMinutes: 43200,
    adapter: "partner",
    description:
      "District composite cost-of-living index from fuel, property, and food basket proxies.",
    methodology:
      "Weighted seed index combining Octane petrol 92 reference price, PropertyLK median bands, and estimated monthly food basket costs. Not an official NCPI publication.",
    metrics: ["col_index", "food_basket_estimate"],
  },
  {
    id: "environment_aqi_seed",
    name: "Lankawa Air Quality Index",
    category: "health",
    url: "internal://environment",
    cadenceMinutes: 1440,
    adapter: "partner",
    description:
      "Representative AQI and PM2.5 bands by administrative district.",
    methodology:
      "IQAir-style representative seed data patterned on urban/rural density proxies. Not live sensor readings.",
    metrics: ["aqi", "pm25"],
  },
  {
    id: "election_commission_2019",
    name: "Election Commission of Sri Lanka",
    category: "civic",
    url: "internal://elections/history",
    cadenceMinutes: 525600,
    adapter: "scrape",
    description: "Presidential election 2019 district-level results (seed).",
    methodology:
      "Historical presidential results seeded from published EC totals. Used as swing baseline for 2024 comparisons.",
    metrics: ["presidential_2019"],
  },
  {
    id: "open_meteo",
    name: "Open-Meteo Forecast API",
    category: "environment",
    url: "https://api.open-meteo.com",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Current temperature, precipitation, and weather conditions for Colombo.",
    methodology:
      "Lankawa polls the Open-Meteo forecast endpoint for Colombo coordinates (6.9271°N, 79.8612°E) with WMO weather codes mapped to short labels. Observations refresh hourly on the home pulse.",
    metrics: ["weather_colombo"],
  },
  {
    id: "ceb_power",
    name: "CEB Care — Power Outages",
    category: "disaster",
    url: "https://cebcare.ceb.lk",
    cadenceMinutes: 15,
    adapter: "scrape",
    description:
      "Scheduled load-shedding and present breakdown outages from CEB Care.",
    methodology:
      "Lankawa polls CEB Care demand-management schedules and samples present outage locations across provinces. Status is normalized to normal, scheduled, outage, or unknown — never a fabricated normal when data is unavailable. Results appear on the home pulse and disaster hub.",
    metrics: ["power_status"],
  },
  {
    id: "cse_lk",
    name: "Colombo Stock Exchange (public HTTP)",
    category: "economy",
    url: "https://www.cse.lk/api",
    cadenceMinutes: 15,
    adapter: "api",
    description:
      "All Share Price Index (ASPI), S&P SL20, and market summary from public CSE JSON endpoints.",
    methodology:
      "Read-only fetch of undocumented public endpoints on `cse.lk` (e.g. `aspiData`, `marketSummery`, `tradeSummary`) — adapter logic ported from the Chime/koel `chime/adapters/cse.py` boundary, not from PulseCSE. No Telegram, no portfolio engine, no duplicate PulseCSE backend. Market-hours data only; delayed figures tagged with freshness tiers. Surfaced on `/economy` pulse, not the home today strip.",
    metrics: ["cse_aspi", "cse_market_status"],
  },
  {
    id: "news_rss",
    name: "Sri Lanka News RSS",
    category: "civic",
    url: "internal://news",
    cadenceMinutes: 60,
    adapter: "api",
    description:
      "Headline count and top story summaries from curated Sri Lanka news RSS feeds.",
    methodology:
      "Server-side RSS/Atom parse of approved public feeds (e.g. Daily Mirror, Ada Derana, NewsFirst). Headlines are normalized in-platform with source attribution — no external click-through links in pulse UI. Pending `src/lib/integrations/news.ts` from parallel agent; source registry reserved for provenance.",
    metrics: ["news_headlines"],
  },
];

export function getSource(id: string): SourceDefinition | undefined {
  return SOURCES.find((source) => source.id === id);
}

export function getSourceProvenancePath(id: string): string {
  return `/sources/${id}`;
}

export function getCategoryLabel(
  category: SourceCategory,
  labels: Record<SourceCategory, string>,
): string {
  return labels[category];
}
