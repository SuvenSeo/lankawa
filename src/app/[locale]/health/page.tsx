import { getTranslations, setRequestLocale } from "next-intl/server";
import { HealthViewToggle } from "@/components/DengueChoroplethMap";
import { Link } from "@/i18n/navigation";
import { getDengueSnapshot } from "@/lib/health";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function HealthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("health");
  const snapshot = getDengueSnapshot();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("weekLabel", {
            week: snapshot.epidemiologicalWeek,
            year: snapshot.year,
          })}{" "}
          ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("nationalCases")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.nationalTotal.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("nationalChange")}</dt>
          <dd
            className={`mt-2 text-3xl font-semibold ${
              snapshot.nationalChangePct >= 0 ? "text-rose-300" : "text-teal-300"
            }`}
          >
            {snapshot.nationalChangePct >= 0 ? "+" : ""}
            {snapshot.nationalChangePct.toFixed(1)}%
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("reportDate")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">{snapshot.asOf}</dd>
        </div>
      </dl>

      <HealthViewToggle districts={snapshot.districts} locale={locale} />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
