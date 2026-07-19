import { computeFreshnessTier } from "@/lib/freshness";
import { getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier, PulseMetric } from "@/lib/types";

const CSE_API_BASE = "https://www.cse.lk/api";
const FETCH_TIMEOUT_MS = 12_000;
const CSE_CADENCE_MINUTES = 15;

export const CSE_SOURCE_ID = "cse_lk";
export const CSE_SOURCE_NAME = "Colombo Stock Exchange";

const CSE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Lankawa/1.0; +https://lankawa.lk)",
  Origin: "https://www.cse.lk",
  Referer: "https://www.cse.lk/",
  Accept: "application/json",
};

export interface CseIndex {
  code: string;
  name: string;
  value: number;
  change: number | null;
  changePct: number | null;
  observedAt: string;
}

export interface CseMover {
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  changePct: number | null;
}

export interface CseMarketSummary {
  tradeCount: number | null;
  shareVolume: number | null;
  turnover: number | null;
  observedAt: string | null;
}

export interface CseSnapshot {
  sourceId: string;
  sourceName: string;
  marketStatus: string | null;
  aspi: CseIndex;
  snp: CseIndex;
  topGainers: CseMover[];
  topLosers: CseMover[];
  summary: CseMarketSummary | null;
  asOf: string;
  tier: FreshnessTier;
  isFallback: boolean;
}

interface CseIndexResponse {
  value?: number;
  indexValue?: number;
  change?: number;
  percentage?: number;
  percentageChange?: number;
  changePct?: number;
  timestamp?: number;
  transactionTime?: number;
}

interface CseMarketStatusResponse {
  status?: string;
}

interface CseMarketSummaryResponse {
  trades?: number;
  shareVolume?: number;
  tradeVolume?: number;
  tradeDate?: number;
}

interface CseTradeSummaryRow {
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  percentageChange?: number;
  lastTradedTime?: number;
}

interface CseTradeSummaryResponse {
  reqTradeSummery?: CseTradeSummaryRow[];
}

const SEED_AS_OF = "2026-07-18T09:30:00.000Z";

const SEED_SNAPSHOT: Omit<CseSnapshot, "tier" | "isFallback"> = {
  sourceId: CSE_SOURCE_ID,
  sourceName: CSE_SOURCE_NAME,
  marketStatus: "Market Closed",
  aspi: {
    code: "ASPI",
    name: "All Share Price Index",
    value: 21_405.41,
    change: -42.16,
    changePct: -0.2,
    observedAt: SEED_AS_OF,
  },
  snp: {
    code: "SNP_SL20",
    name: "S&P Sri Lanka 20",
    value: 5_999.68,
    change: -5.31,
    changePct: -0.09,
    observedAt: SEED_AS_OF,
  },
  topGainers: [
    {
      symbol: "JKH.N0000",
      name: "JOHN KEELLS HOLDINGS PLC",
      price: 24.5,
      change: 1.2,
      changePct: 5.15,
    },
    {
      symbol: "COMB.N0000",
      name: "COMMERCIAL BANK OF CEYLON PLC",
      price: 142.0,
      change: 4.5,
      changePct: 3.27,
    },
    {
      symbol: "HNB.N0000",
      name: "HATTON NATIONAL BANK PLC",
      price: 198.75,
      change: 5.25,
      changePct: 2.71,
    },
  ],
  topLosers: [
    {
      symbol: "CTC.N0000",
      name: "CEYLON TOBACCO COMPANY PLC",
      price: 1_025.0,
      change: -18.5,
      changePct: -1.77,
    },
    {
      symbol: "DIAL.N0000",
      name: "DIALOG AXIATA PLC",
      price: 12.4,
      change: -0.2,
      changePct: -1.59,
    },
    {
      symbol: "LOLC.N0000",
      name: "LOLC HOLDINGS PLC",
      price: 620.0,
      change: -8.0,
      changePct: -1.27,
    },
  ],
  summary: {
    tradeCount: 13_397,
    shareVolume: 31_937_752,
    turnover: 722_636_709.45,
    observedAt: SEED_AS_OF,
  },
  asOf: SEED_AS_OF,
};

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function msToIso(ms: unknown, fallback: string): string {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    return fallback;
  }
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

async function postCseJson<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${CSE_API_BASE}${path}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        ...CSE_HEADERS,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function parseIndex(
  raw: CseIndexResponse | null,
  defaults: { code: string; name: string },
  fallback: CseIndex,
): CseIndex {
  if (!raw) {
    return fallback;
  }

  const value = finiteNumber(raw.value ?? raw.indexValue);
  if (value == null) {
    return fallback;
  }

  const observedAt = msToIso(raw.timestamp ?? raw.transactionTime, fallback.observedAt);
  const changePct = finiteNumber(
    raw.percentage ?? raw.percentageChange ?? raw.changePct,
  );

  return {
    code: defaults.code,
    name: defaults.name,
    value,
    change: finiteNumber(raw.change),
    changePct,
    observedAt,
  };
}

function parseMover(row: CseTradeSummaryRow): CseMover | null {
  if (typeof row.symbol !== "string" || !row.symbol.trim()) {
    return null;
  }

  const price = finiteNumber(row.price);
  if (price == null) {
    return null;
  }

  return {
    symbol: row.symbol.trim().toUpperCase(),
    name: typeof row.name === "string" && row.name.trim() ? row.name.trim() : row.symbol,
    price,
    change: finiteNumber(row.change),
    changePct: finiteNumber(row.percentageChange),
  };
}

function pickTopMovers(rows: CseTradeSummaryRow[]): {
  topGainers: CseMover[];
  topLosers: CseMover[];
} {
  const movers = rows
    .map(parseMover)
    .filter((mover): mover is CseMover => mover != null && mover.changePct != null);

  const topGainers = [...movers]
    .sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0))
    .slice(0, 5);

  const topLosers = [...movers]
    .sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0))
    .slice(0, 5);

  return { topGainers, topLosers };
}

function buildSnapshotFromLive(parts: {
  aspi: CseIndexResponse | null;
  snp: CseIndexResponse | null;
  marketStatus: CseMarketStatusResponse | null;
  marketSummary: CseMarketSummaryResponse | null;
  tradeSummary: CseTradeSummaryResponse | null;
}): CseSnapshot | null {
  const aspi = parseIndex(parts.aspi, {
    code: "ASPI",
    name: "All Share Price Index",
  }, SEED_SNAPSHOT.aspi);
  const snp = parseIndex(parts.snp, {
    code: "SNP_SL20",
    name: "S&P Sri Lanka 20",
  }, SEED_SNAPSHOT.snp);

  const hasLiveIndex =
    parts.aspi != null &&
    finiteNumber(parts.aspi.value ?? parts.aspi.indexValue) != null;

  if (!hasLiveIndex) {
    return null;
  }

  const movers = pickTopMovers(parts.tradeSummary?.reqTradeSummery ?? []);
  const summaryObservedAt = msToIso(
    parts.marketSummary?.tradeDate,
    aspi.observedAt,
  );

  const asOf = [aspi.observedAt, snp.observedAt, summaryObservedAt]
    .sort()
    .at(-1) ?? aspi.observedAt;

  return {
    sourceId: CSE_SOURCE_ID,
    sourceName: CSE_SOURCE_NAME,
    marketStatus:
      typeof parts.marketStatus?.status === "string"
        ? parts.marketStatus.status
        : null,
    aspi,
    snp,
    topGainers:
      movers.topGainers.length > 0 ? movers.topGainers : SEED_SNAPSHOT.topGainers,
    topLosers:
      movers.topLosers.length > 0 ? movers.topLosers : SEED_SNAPSHOT.topLosers,
    summary: parts.marketSummary
      ? {
          tradeCount: finiteNumber(parts.marketSummary.trades),
          shareVolume: finiteNumber(parts.marketSummary.shareVolume),
          turnover: finiteNumber(parts.marketSummary.tradeVolume),
          observedAt: summaryObservedAt,
        }
      : SEED_SNAPSHOT.summary,
    asOf,
    tier: computeFreshnessTier(asOf, CSE_CADENCE_MINUTES),
    isFallback: false,
  };
}

function buildFallbackSnapshot(): CseSnapshot {
  return {
    ...SEED_SNAPSHOT,
    tier: "stale",
    isFallback: true,
  };
}

export async function buildCseSnapshot(): Promise<CseSnapshot> {
  const [aspi, snp, marketStatus, marketSummary, tradeSummary] = await Promise.all([
    postCseJson<CseIndexResponse>("/aspiData"),
    postCseJson<CseIndexResponse>("/snpData"),
    postCseJson<CseMarketStatusResponse>("/marketStatus"),
    postCseJson<CseMarketSummaryResponse>("/marketSummery"),
    postCseJson<CseTradeSummaryResponse>("/tradeSummary"),
  ]);

  const live = buildSnapshotFromLive({
    aspi,
    snp,
    marketStatus,
    marketSummary,
    tradeSummary,
  });

  return live ?? buildFallbackSnapshot();
}

export async function buildCsePulseMetric(checkedAt: string): Promise<PulseMetric> {
  const snapshot = await buildCseSnapshot();
  return buildCsePulseMetricFromSnapshot(checkedAt, snapshot);
}

export function buildCsePulseMetricFromSnapshot(
  checkedAt: string,
  snapshot: CseSnapshot,
): PulseMetric {
  const tier = computeFreshnessTier(
    snapshot.asOf,
    CSE_CADENCE_MINUTES,
    new Date(checkedAt).getTime(),
  );
  const changeNote =
    snapshot.aspi.changePct == null
      ? undefined
      : `${snapshot.aspi.changePct >= 0 ? "+" : ""}${snapshot.aspi.changePct.toFixed(2)}%`;

  return {
    id: "cse_aspi",
    label: "ASPI",
    value: snapshot.aspi.value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    }),
    unit: "pts",
    observedAt: snapshot.asOf,
    tier,
    sourceId: CSE_SOURCE_ID,
    provenancePath: getSourceProvenancePath(CSE_SOURCE_ID),
    note: changeNote,
  };
}
