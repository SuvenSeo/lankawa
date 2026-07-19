import { fetchNewsPulse } from "@/lib/integrations/news";
import { jsonWithCache } from "@/lib/api-cache";

export async function GET(request: Request) {
  const pulse = await fetchNewsPulse();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      sourceId: pulse.sourceId,
      fetchedAt: pulse.fetchedAt,
      provenancePath: pulse.provenancePath,
      headlines: pulse.headlines.slice(0, 10).map((headline) => ({
        title: headline.title,
        url: headline.url,
        publishedAt: headline.publishedAt,
        source: headline.source,
      })),
    },
    { maxAge: 1800, staleWhileRevalidate: 3600, request },
  );
}
