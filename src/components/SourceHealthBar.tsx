import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { FreshnessTier } from "@/lib/types";

export async function SourceHealthBar({
  sources,
}: {
  sources: Array<{
    id: string;
    name: string;
    tier: FreshnessTier;
    provenancePath: string;
  }>;
}) {
  const t = await getTranslations("home");

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
      aria-label={t("sourcesTitle")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span
            className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80"
            aria-hidden="true"
          />
          <span>{t("sourcesCompact")}</span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <li key={source.id}>
              <Link
                href={source.provenancePath}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300 transition hover:border-teal-400/25 hover:text-white"
              >
                <span className="max-w-[8rem] truncate sm:max-w-none">{source.name}</span>
                <FreshnessBadge tier={source.tier} />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/sources"
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-teal-300 hover:text-teal-200"
            >
              {t("viewAllSources")}
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
