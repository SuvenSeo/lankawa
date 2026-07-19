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
      "Hospitals, schools, and GN offices indexed by district (seed data).",
    methodology:
      "A curated seed directory covers Colombo, Kandy, and Galle districts deeply. Other districts show a coming-soon placeholder until official open-data feeds are integrated.",
    metrics: ["public_services"],
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
