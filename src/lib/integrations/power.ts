import { computeFreshnessTier } from "../freshness";
import { getSource, getSourceProvenancePath } from "../sources";
import type { FreshnessTier, PulseMetric, SourceHealth } from "../types";

const CEB_BASE = "https://cebcare.ceb.lk";
const CEB_SCHEDULE_URL = `${CEB_BASE}/Incognito/DemandMgmtSchedule`;
const CEB_OUTAGE_MAP_URL = `${CEB_BASE}/incognito/outagemap`;

const BOT_USER_AGENT =
  "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa; civic-data)";

const FETCH_REVALIDATE_SECONDS = 900;
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 400;
const MAX_AFFECTED_AREAS = 12;
const MAX_GROUP_GEO_LOOKUPS = 4;
const PRESENT_OUTAGE_CONCURRENCY = 4;

export type PowerSupplyStatus = "normal" | "scheduled" | "outage" | "unknown";

export interface PowerStatus {
  status: PowerSupplyStatus;
  summary: string;
  affectedAreas: string[];
  observedAt: string;
  sourceId: "ceb_power";
  /** Internal path for outage context — links to the disaster hub. */
  provenancePath: "/disaster";
}

interface CebSession {
  token: string;
  cookieHeader: string;
}

interface CebProvince {
  ProvinceId: string;
  ProvinceName: string;
}

interface CebArea {
  AreaId: string;
  AreaName: string;
}

interface LoadSheddingEvent {
  id?: string;
  loadShedGroupId: string;
  startTime: string;
  endTime: string;
  description?: string;
}

interface PresentOutageCluster {
  NumberOfCustomers?: number;
  TimeStamp?: string;
  InterruptionTypeName?: string;
}

interface GeoAreaRow {
  GssName?: string;
  FeederName?: string;
  FeedingArea?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = RETRY_ATTEMPTS,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function formatColomboDate(date: Date, offsetDays = 0): string {
  const shifted = new Date(date.getTime() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(shifted);
}

function extractRequestVerificationToken(html: string): string | null {
  const match = html.match(
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/,
  );
  return match?.[1] ?? null;
}

function buildCookieHeader(setCookieHeaders: string[]): string {
  const pairs: string[] = [];

  for (const header of setCookieHeaders) {
    const segment = header.split(";")[0]?.trim();
    if (segment) {
      pairs.push(segment);
    }
  }

  return pairs.join("; ");
}

async function parseCebJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error("CEB returned an empty response body");
  }

  const parsed: unknown = JSON.parse(text);
  if (typeof parsed === "string") {
    return JSON.parse(parsed) as T;
  }

  return parsed as T;
}

async function bootstrapCebSession(pageUrl: string): Promise<CebSession> {
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent": BOT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: FETCH_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`CEB session bootstrap failed with ${response.status}`);
  }

  const html = await response.text();
  const token = extractRequestVerificationToken(html);

  if (!token) {
    throw new Error("CEB anti-forgery token missing from schedule page");
  }

  const setCookie =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  return {
    token,
    cookieHeader: buildCookieHeader(setCookie),
  };
}

function cebHeaders(session: CebSession): HeadersInit {
  return {
    "User-Agent": BOT_USER_AGENT,
    Accept: "application/json, text/plain, */*",
    Cookie: session.cookieHeader,
    RequestVerificationToken: session.token,
    "X-Requested-With": "XMLHttpRequest",
  };
}

async function fetchLoadSheddingEvents(
  session: CebSession,
  startDate: string,
  endDate: string,
): Promise<LoadSheddingEvent[]> {
  const body = new URLSearchParams({
    StartTime: startDate,
    EndTime: endDate,
  });

  const response = await fetch(`${CEB_BASE}/Incognito/GetLoadSheddingEvents`, {
    method: "POST",
    headers: {
      ...cebHeaders(session),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    next: { revalidate: FETCH_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`CEB load-shedding events returned ${response.status}`);
  }

  const events = await parseCebJson<LoadSheddingEvent[]>(response);
  return Array.isArray(events) ? events : [];
}

async function fetchProvinces(session: CebSession): Promise<CebProvince[]> {
  const response = await fetch(`${CEB_BASE}/Incognito/GetProvinces`, {
    headers: cebHeaders(session),
    next: { revalidate: FETCH_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`CEB provinces returned ${response.status}`);
  }

  const provinces = await parseCebJson<CebProvince[]>(response);
  return Array.isArray(provinces) ? provinces : [];
}

async function fetchAreasForProvince(
  session: CebSession,
  provinceId: string,
): Promise<CebArea[]> {
  const response = await fetch(
    `${CEB_BASE}/Incognito/GetAreasByProvince?provinceId=${encodeURIComponent(provinceId)}`,
    {
      headers: cebHeaders(session),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`CEB areas for ${provinceId} returned ${response.status}`);
  }

  const areas = await parseCebJson<CebArea[]>(response);
  return Array.isArray(areas) ? areas : [];
}

async function fetchPresentOutagesInArea(
  session: CebSession,
  areaId: string,
): Promise<PresentOutageCluster[]> {
  const response = await fetch(
    `${CEB_BASE}/Incognito/GetOutageLocationsInArea?areaId=${encodeURIComponent(areaId)}`,
    {
      headers: cebHeaders(session),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`CEB present outages for area ${areaId} returned ${response.status}`);
  }

  const clusters = await parseCebJson<PresentOutageCluster[]>(response);
  return Array.isArray(clusters) ? clusters : [];
}

async function fetchGroupGeoAreas(
  session: CebSession,
  groupId: string,
): Promise<string[]> {
  const response = await fetch(
    `${CEB_BASE}/Incognito/GetLoadSheddingGeoAreas?LoadShedGroupId=${encodeURIComponent(groupId)}`,
    {
      headers: cebHeaders(session),
      next: { revalidate: FETCH_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    return [`Group ${groupId}`];
  }

  const rows = await parseCebJson<GeoAreaRow[]>(response);
  if (!Array.isArray(rows) || rows.length === 0) {
    return [`Group ${groupId}`];
  }

  const labels = new Set<string>();

  for (const row of rows) {
    const feedingArea = row.FeedingArea?.replace(/,\s*$/, "").trim();
    if (feedingArea) {
      labels.add(feedingArea);
      continue;
    }

    const substation = row.GssName?.trim();
    const feeder = row.FeederName?.trim();
    if (substation && feeder) {
      labels.add(`${substation} (${feeder})`);
    } else if (substation) {
      labels.add(substation);
    }
  }

  if (labels.size === 0) {
    return [`Group ${groupId}`];
  }

  return [...labels];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]!);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );

  await Promise.all(workers);
  return results;
}

function uniqueLimited(values: string[], limit: number): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    output.push(trimmed);
    if (output.length >= limit) {
      break;
    }
  }

  return output;
}

function isEventActive(event: LoadSheddingEvent, nowMs: number): boolean {
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();
  return !Number.isNaN(start) && !Number.isNaN(end) && start <= nowMs && nowMs <= end;
}

function isEventUpcoming(event: LoadSheddingEvent, nowMs: number): boolean {
  const start = new Date(event.startTime).getTime();
  return !Number.isNaN(start) && start > nowMs;
}

async function collectPresentOutageAreas(
  session: CebSession,
): Promise<string[]> {
  const provinces = await fetchProvinces(session);
  const sampleAreas: CebArea[] = [];

  for (const province of provinces) {
    const provinceId = province.ProvinceId.trim();
    const areas = await fetchAreasForProvince(session, provinceId);
    const firstArea = areas[0];
    if (firstArea) {
      sampleAreas.push(firstArea);
    }
  }

  const outageAreaNames = await mapWithConcurrency(
    sampleAreas,
    PRESENT_OUTAGE_CONCURRENCY,
    async (area) => {
      const clusters = await fetchPresentOutagesInArea(session, area.AreaId);
      return clusters.length > 0 ? area.AreaName : null;
    },
  );

  return uniqueLimited(
    outageAreaNames.filter((name): name is string => Boolean(name)),
    MAX_AFFECTED_AREAS,
  );
}

async function collectScheduledAreaLabels(
  session: CebSession,
  groupIds: string[],
): Promise<string[]> {
  const labels: string[] = [];

  for (const groupId of groupIds.slice(0, MAX_GROUP_GEO_LOOKUPS)) {
    const groupLabels = await fetchGroupGeoAreas(session, groupId);
    labels.push(...groupLabels);
  }

  for (const groupId of groupIds.slice(MAX_GROUP_GEO_LOOKUPS)) {
    labels.push(`Group ${groupId}`);
  }

  return uniqueLimited(labels, MAX_AFFECTED_AREAS);
}

function buildUnknownStatus(observedAt: string, summary: string): PowerStatus {
  return {
    status: "unknown",
    summary,
    affectedAreas: [],
    observedAt,
    sourceId: "ceb_power",
    provenancePath: "/disaster",
  };
}

/**
 * Fetches national power status from the public CEB Care demand-management
 * schedule and present-outage map (cebcare.ceb.lk).
 */
export async function fetchPowerStatus(): Promise<PowerStatus> {
  const observedAt = new Date().toISOString();

  try {
    return await withRetry(async () => {
      const scheduleSession = await bootstrapCebSession(CEB_SCHEDULE_URL);
      const outageSession = await bootstrapCebSession(CEB_OUTAGE_MAP_URL);

      const startDate = formatColomboDate(new Date(), 0);
      const endDate = formatColomboDate(new Date(), 2);
      const nowMs = Date.now();

      const [events, presentOutageAreas] = await Promise.all([
        fetchLoadSheddingEvents(scheduleSession, startDate, endDate),
        collectPresentOutageAreas(outageSession),
      ]);

      const activeEvents = events.filter((event) => isEventActive(event, nowMs));
      const upcomingEvents = events.filter((event) => isEventUpcoming(event, nowMs));
      const groupIds = uniqueLimited(
        events.map((event) => event.loadShedGroupId),
        MAX_AFFECTED_AREAS,
      );

      if (presentOutageAreas.length > 0) {
        return {
          status: "outage",
          summary: `${presentOutageAreas.length} CEB area(s) report active breakdown outages`,
          affectedAreas: presentOutageAreas,
          observedAt,
          sourceId: "ceb_power",
          provenancePath: "/disaster",
        };
      }

      if (activeEvents.length > 0) {
        const affectedAreas = await collectScheduledAreaLabels(
          scheduleSession,
          uniqueLimited(
            activeEvents.map((event) => event.loadShedGroupId),
            MAX_AFFECTED_AREAS,
          ),
        );

        return {
          status: "outage",
          summary: `${activeEvents.length} demand-management outage window(s) active now`,
          affectedAreas,
          observedAt,
          sourceId: "ceb_power",
          provenancePath: "/disaster",
        };
      }

      if (upcomingEvents.length > 0 || events.length > 0) {
        const affectedAreas = await collectScheduledAreaLabels(
          scheduleSession,
          groupIds,
        );

        return {
          status: "scheduled",
          summary: `${upcomingEvents.length || events.length} scheduled CEB interruption(s) published`,
          affectedAreas,
          observedAt,
          sourceId: "ceb_power",
          provenancePath: "/disaster",
        };
      }

      return {
        status: "normal",
        summary: "No scheduled interruptions or sampled present outages reported by CEB Care",
        affectedAreas: [],
        observedAt,
        sourceId: "ceb_power",
        provenancePath: "/disaster",
      };
    });
  } catch {
    return buildUnknownStatus(
      observedAt,
      "Power status unavailable — CEB Care could not be reached",
    );
  }
}

function powerStatusLabel(status: PowerSupplyStatus): string {
  switch (status) {
    case "normal":
      return "Normal";
    case "scheduled":
      return "Scheduled cuts";
    case "outage":
      return "Active outages";
    case "unknown":
      return "Unknown";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export async function buildPowerPulseMetric(checkedAt: string): Promise<{
  metric: PulseMetric;
  health: SourceHealth;
}> {
  const source = getSource("ceb_power")!;

  try {
    const power = await fetchPowerStatus();
    const tier =
      power.status === "unknown"
        ? ("unknown" satisfies FreshnessTier)
        : computeFreshnessTier(power.observedAt, source.cadenceMinutes);

    return {
      metric: {
        id: "power_status",
        label: "Power supply",
        value: powerStatusLabel(power.status),
        observedAt: power.status === "unknown" ? null : power.observedAt,
        tier,
        sourceId: source.id,
        provenancePath: power.provenancePath,
        note: power.summary,
      },
      health: {
        id: source.id,
        name: source.name,
        category: source.category,
        tier,
        lastSuccessAt: power.status === "unknown" ? null : power.observedAt,
        lastCheckedAt: checkedAt,
        error: power.status === "unknown" ? power.summary : null,
        provenancePath: getSourceProvenancePath(source.id),
      },
    };
  } catch (error) {
    const tier: FreshnessTier = "unknown";

    return {
      metric: {
        id: "power_status",
        label: "Power supply",
        value: "Unknown",
        observedAt: null,
        tier,
        sourceId: source.id,
        provenancePath: "/disaster",
        note: "Power status unavailable",
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
