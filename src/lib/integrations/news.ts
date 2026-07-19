import { readFile } from "node:fs/promises";
import path from "node:path";
import { computeFreshnessTier } from "@/lib/freshness";
import { getSourceProvenancePath } from "@/lib/sources";
import type { FreshnessTier, PulseMetric, SourceHealth } from "@/lib/types";

const NEWS_SOURCE_ID = "news_rss";
const NEWS_CADENCE_MINUTES = 30;
const CACHE_PATH = path.join(process.cwd(), "ingest", "output", "sl_news.json");
const FETCH_TIMEOUT_MS = 12_000;

export const SL_NEWS_FEEDS = [
  {
    id: "daily_mirror",
    name: "Daily Mirror",
    url: "https://www.dailymirror.lk/rss/breaking_news/108",
  },
  {
    id: "ada_derana",
    name: "Ada Derana",
    url: "https://adaderana.lk/rss.php",
  },
] as const;

export interface NewsHeadline {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface NewsPulse {
  sourceId: string;
  fetchedAt: string;
  headlines: NewsHeadline[];
  provenancePath: string;
}

interface CachePayload {
  sourceId?: string;
  fetchedAt?: string;
  headlines?: Array<{
    title: string;
    url: string;
    published_at?: string;
    publishedAt?: string;
    source: string;
  }>;
}

const RSS_BLOCK_RE = /<rss[\s\S]*?<\/rss>/i;
const ITEM_RE = /<item\b[\s\S]*?<\/item>/gi;
const TAG_RE = (tag: string) =>
  new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseRssDate(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  const normalized = value.replace(" ", "T");
  const fallback = Date.parse(`${normalized}Z`);
  if (!Number.isNaN(fallback)) {
    return new Date(fallback).toISOString();
  }

  return new Date().toISOString();
}

function parseRssItems(xml: string, sourceId: string): NewsHeadline[] {
  const block = xml.match(RSS_BLOCK_RE)?.[0] ?? xml;
  const items = block.match(ITEM_RE) ?? [];
  const headlines: NewsHeadline[] = [];

  for (const item of items) {
    const title = stripTags(item.match(TAG_RE("title"))?.[1] ?? "");
    const url = stripTags(
      item.match(TAG_RE("link"))?.[1] ??
        item.match(TAG_RE("guid"))?.[1] ??
        "",
    );
    if (!title || !url) {
      continue;
    }

    const publishedRaw =
      item.match(TAG_RE("pubDate"))?.[1] ??
      item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1] ??
      item.match(TAG_RE("updated"))?.[1];

    headlines.push({
      title,
      url,
      publishedAt: parseRssDate(publishedRaw),
      source: sourceId,
    });
  }

  return headlines;
}

async function fetchFeed(
  sourceId: string,
  url: string,
): Promise<NewsHeadline[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: NEWS_CADENCE_MINUTES * 60 },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
        "User-Agent": "LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)",
      },
    });

    if (!response.ok) {
      throw new Error(`${sourceId} RSS returned ${response.status}`);
    }

    const xml = await response.text();
    return parseRssItems(xml, sourceId);
  } finally {
    clearTimeout(timeout);
  }
}

async function readIngestCache(): Promise<NewsPulse | null> {
  try {
    const raw = await readFile(CACHE_PATH, "utf8");
    const data = JSON.parse(raw) as CachePayload;
    const headlines = (data.headlines ?? [])
      .map((item) => ({
        title: item.title,
        url: item.url,
        publishedAt: item.publishedAt ?? item.published_at ?? new Date().toISOString(),
        source: item.source,
      }))
      .filter((item) => item.title && item.url);

    if (!data.fetchedAt || headlines.length === 0) {
      return null;
    }

    return {
      sourceId: data.sourceId ?? NEWS_SOURCE_ID,
      fetchedAt: data.fetchedAt,
      headlines,
      provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
    };
  } catch {
    return null;
  }
}

async function fetchLiveNewsPulse(): Promise<NewsPulse> {
  const fetchedAt = new Date().toISOString();
  const results = await Promise.allSettled(
    SL_NEWS_FEEDS.map((feed) => fetchFeed(feed.id, feed.url)),
  );

  const seen = new Set<string>();
  const headlines: NewsHeadline[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }
    for (const headline of result.value) {
      if (seen.has(headline.url)) {
        continue;
      }
      seen.add(headline.url);
      headlines.push(headline);
    }
  }

  headlines.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  if (headlines.length === 0) {
    throw new Error("All Sri Lanka news RSS feeds failed");
  }

  return {
    sourceId: NEWS_SOURCE_ID,
    fetchedAt,
    headlines: headlines.slice(0, 30),
    provenancePath: getSourceProvenancePath(NEWS_SOURCE_ID),
  };
}

function isCacheFresh(fetchedAt: string): boolean {
  const ageMinutes = (Date.now() - new Date(fetchedAt).getTime()) / 60_000;
  return ageMinutes <= NEWS_CADENCE_MINUTES;
}

export async function fetchNewsPulse(): Promise<NewsPulse> {
  const cached = await readIngestCache();
  if (cached && isCacheFresh(cached.fetchedAt)) {
    return cached;
  }

  try {
    return await fetchLiveNewsPulse();
  } catch (error) {
    if (cached) {
      return cached;
    }
    throw error;
  }
}

export function buildNewsPulseMetric(checkedAt: string, pulse: NewsPulse): {
  metric: PulseMetric;
  health: SourceHealth;
} {
  const latestPublished =
    pulse.headlines[0]?.publishedAt ?? pulse.fetchedAt;
  const tier: FreshnessTier = computeFreshnessTier(
    latestPublished,
    NEWS_CADENCE_MINUTES,
    Date.parse(checkedAt),
  );
  const provenancePath = getSourceProvenancePath(NEWS_SOURCE_ID);
  const topHeadline = pulse.headlines[0]?.title ?? "No headlines";

  return {
    metric: {
      id: "news_headlines",
      label: "Sri Lanka news",
      value: String(pulse.headlines.length),
      unit: "headlines",
      observedAt: latestPublished,
      tier,
      sourceId: NEWS_SOURCE_ID,
      provenancePath,
      note: topHeadline,
    },
    health: {
      id: NEWS_SOURCE_ID,
      name: "Sri Lanka news RSS",
      category: "civic",
      tier,
      lastSuccessAt: pulse.fetchedAt,
      lastCheckedAt: checkedAt,
      error: null,
      provenancePath,
    },
  };
}
