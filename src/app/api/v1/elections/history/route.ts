import {
  getParliamentaryHistoryMeta,
  getPresidentialHistoryCycles,
} from "@/lib/election-history";
import { jsonWithCache } from "@/lib/api-cache";

export async function GET(request: Request) {
  const presidential = getPresidentialHistoryCycles();
  const parliamentary = getParliamentaryHistoryMeta();

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      presidential: {
        cycles: presidential.map((cycle) => ({
          year: cycle.year,
          id: cycle.id,
          date: cycle.date,
          label: cycle.label,
          nationalWinner: cycle.nationalWinner,
          turnout: cycle.turnout,
          validVotes: cycle.validVotes,
          candidates: cycle.candidates,
          districtCount: cycle.districts.length,
          sourceId: cycle.sourceId,
          provenancePath: `/sources/${cycle.sourceId}`,
        })),
      },
      parliamentary,
    },
    { maxAge: 86400, staleWhileRevalidate: 604800, request },
  );
}
