import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { CseMover, CseSnapshot } from "@/lib/integrations/cse";
import { getSourceProvenancePath } from "@/lib/sources";

function formatChange(change: number | null, changePct: number | null): string {
  if (change == null && changePct == null) {
    return "—";
  }

  const parts: string[] = [];
  if (change != null) {
    parts.push(`${change >= 0 ? "+" : ""}${change.toFixed(2)}`);
  }
  if (changePct != null) {
    parts.push(`(${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)`);
  }
  return parts.join(" ");
}

function MoverList({
  title,
  movers,
  emptyLabel,
}: {
  title: string;
  movers: CseMover[];
  emptyLabel: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300">{title}</h3>
      {movers.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {movers.map((mover) => {
            const positive = (mover.changePct ?? 0) >= 0;
            return (
              <li
                key={mover.symbol}
                className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-black/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-white">{mover.symbol}</p>
                  <p className="text-xs text-slate-500">{mover.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {mover.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      positive ? "text-teal-300" : "text-rose-300"
                    }`}
                  >
                    {formatChange(mover.change, mover.changePct)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function CseMarketCard({
  snapshot,
  labels,
}: {
  snapshot: CseSnapshot;
  labels: {
    title: string;
    subtitle: string;
    sourceName: string;
    aspi: string;
    snp: string;
    gainers: string;
    losers: string;
    marketStatus: string;
    trades: string;
    shareVolume: string;
    turnover: string;
    fallbackNote: string;
    noMovers: string;
  };
}) {
  const indices = [
    { key: "aspi", label: labels.aspi, index: snapshot.aspi },
    { key: "snp", label: labels.snp, index: snapshot.snp },
  ] as const;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {labels.subtitle} ·{" "}
            <Link
              href={getSourceProvenancePath(snapshot.sourceId)}
              className="text-teal-300 hover:text-teal-200"
            >
              {labels.sourceName}
            </Link>
          </p>
          {snapshot.marketStatus ? (
            <p className="mt-1 text-sm text-slate-500">
              {labels.marketStatus}: {snapshot.marketStatus}
            </p>
          ) : null}
        </div>
        <FreshnessBadge tier={snapshot.tier} />
      </div>

      {snapshot.isFallback ? (
        <p className="text-sm text-amber-200/90">{labels.fallbackNote}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {indices.map(({ key, label, index }) => {
          const positive = (index.changePct ?? 0) >= 0;
          return (
            <article
              key={key}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {index.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  positive ? "text-teal-300" : "text-rose-300"
                }`}
              >
                {formatChange(index.change, index.changePct)}
              </p>
            </article>
          );
        })}

        {snapshot.summary ? (
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-500">{labels.trades}</p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {snapshot.summary.tradeCount?.toLocaleString() ?? "—"}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <p>
                {labels.shareVolume}:{" "}
                {snapshot.summary.shareVolume?.toLocaleString() ?? "—"}
              </p>
              <p>
                {labels.turnover}:{" "}
                {snapshot.summary.turnover?.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                }) ?? "—"}{" "}
                LKR
              </p>
            </div>
          </article>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MoverList
          title={labels.gainers}
          movers={snapshot.topGainers}
          emptyLabel={labels.noMovers}
        />
        <MoverList
          title={labels.losers}
          movers={snapshot.topLosers}
          emptyLabel={labels.noMovers}
        />
      </div>
    </section>
  );
}
