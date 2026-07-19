import { buildCseSnapshot } from "@/lib/integrations/cse";
import { jsonWithCache } from "@/lib/api-cache";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const snapshot = await buildCseSnapshot();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      ...snapshot,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 300, staleWhileRevalidate: 900, request },
  );
}
