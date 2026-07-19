import { Link } from "@/i18n/navigation";
import {
  getParliamentaryParty,
  getPartyColor,
  getPartySeatShare,
} from "@/lib/elections";
import type { ParliamentaryDistrictResult } from "@/lib/types";

export function ParliamentaryDistrictRow({
  result,
}: {
  result: ParliamentaryDistrictResult;
}) {
  const winner = getParliamentaryParty(result.winner);
  const winnerSeats = result.seats[result.winner];
  const winnerShare = getPartySeatShare(result, result.winner);

  return (
    <Link
      href={`/elections/parliamentary/${result.slug}`}
      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-teal-400/30 hover:bg-white/10"
    >
      <div>
        <p className="font-medium text-white">{result.name}</p>
        <p className="text-xs text-slate-500">
          {result.province} · {result.totalSeats} seats
        </p>
      </div>
      <div className="text-right">
        {winner ? (
          <p
            className="text-sm font-medium"
            style={{ color: getPartyColor(result.winner) }}
          >
            {winner.abbreviation}
          </p>
        ) : null}
        <p className="text-xs text-slate-400">
          {winnerSeats}/{result.totalSeats} ({winnerShare.toFixed(0)}%)
        </p>
      </div>
    </Link>
  );
}

export function ParliamentarySeatBars({
  result,
}: {
  result: ParliamentaryDistrictResult;
}) {
  const parties = Object.entries(result.seats).filter(([, seats]) => seats > 0);

  return (
    <div className="space-y-3">
      {parties.map(([partyId, seats]) => {
        const party = getParliamentaryParty(partyId);
        const pct = getPartySeatShare(result, partyId as typeof result.winner);
        return (
          <div key={partyId}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-300">
                {party?.abbreviation ?? partyId}
              </span>
              <span className="text-slate-400">
                {seats} seats ({pct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: getPartyColor(partyId as typeof result.winner),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
