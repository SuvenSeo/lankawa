import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import {
  buildNewsPulseMetric,
  fetchNewsPulse,
  SL_NEWS_FEEDS,
} from "@/lib/integrations/news";

function sourceLabel(
  sourceId: string,
  labels: Record<string, string>,
): string {
  const feed = SL_NEWS_FEEDS.find((item) => item.id === sourceId);
  return labels[sourceId] ?? feed?.name ?? sourceId;
}

export async function NewsPulse() {
  const t = await getTranslations("news");

  let pulse;
  try {
    pulse = await fetchNewsPulse();
  } catch {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>
        <p className="lk-card p-5 text-sm text-slate-400">{t("noHeadlines")}</p>
      </section>
    );
  }

  const { metric } = buildNewsPulseMetric(new Date().toISOString(), pulse);
  const headlines = pulse.headlines.slice(0, 5);
  const sourceLabels = {
    daily_mirror: t("sourceMirror"),
    ada_derana: t("sourceAda"),
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
          <p className="mt-2 text-slate-400">{t("subtitle")}</p>
        </div>
        <Link href="/sources/news_rss" className="lk-btn-primary">
          {t("viewAll")}
        </Link>
      </div>

      <article className="lk-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {t("headlineCount", { count: pulse.headlines.length })}
          </p>
          <FreshnessBadge tier={metric.tier} />
        </div>

        <ul className="space-y-3" role="list">
          {headlines.map((headline, index) => (
            <li key={`${headline.url}-${index}`}>
              <Link
                href="/sources/news_rss"
                className="group block rounded-lg border border-transparent px-3 py-2 transition hover:border-[var(--lk-border)] hover:bg-[var(--lk-surface)]/60"
              >
                <p className="text-sm font-medium text-white group-hover:text-teal-100">
                  {headline.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {sourceLabel(headline.source, sourceLabels)}
                  {headline.publishedAt
                    ? ` · ${new Date(headline.publishedAt).toLocaleString()}`
                    : null}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--lk-border)] pt-4 text-xs text-slate-500">
          <span>{t("provenance")}</span>
          <Link
            href={pulse.provenancePath}
            className="text-teal-300 hover:text-teal-200"
          >
            {t("viewSource")}
          </Link>
        </footer>
      </article>
    </section>
  );
}
