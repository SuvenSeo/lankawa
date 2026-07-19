import { getTranslations, setRequestLocale } from "next-intl/server";
import { PropertyChoroplethMap } from "@/components/PropertyChoroplethLazy";
import { PropertyDistrictTable } from "@/components/PropertyDistrictTable";
import { Link } from "@/i18n/navigation";
import {
  formatPropertyPrice,
  getNationalMedianPerPerch,
  getPropertySnapshot,
} from "@/lib/property";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("property");
  const snapshot = getPropertySnapshot();
  const nationalMedian = getNationalMedianPerPerch();
  const colombo = snapshot.districts.find(
    (district) => district.slug === "colombo",
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-slate-500">
          {t("asOf", { date: snapshot.asOf })} ·{" "}
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
          <dt className="text-sm text-slate-500">{t("nationalMedian")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            LKR {formatPropertyPrice(nationalMedian)}
            <span className="ml-2 text-base font-normal text-slate-400">
              /{t("perchUnit")}
            </span>
          </dd>
        </div>
        {colombo ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("colomboMedian")}</dt>
            <dd className="mt-2 text-3xl font-semibold text-white">
              LKR {formatPropertyPrice(colombo.medianPerPerch)}
              <span className="ml-2 text-base font-normal text-slate-400">
                /{t("perchUnit")}
              </span>
            </dd>
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("districtsCovered")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {snapshot.districts.length}
          </dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
        <p className="text-sm text-slate-400">{t("mapSubtitle")}</p>
        <PropertyChoroplethMap />
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-teal-800" />
            {t("mapLegendHigh")}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-teal-400" />
            {t("mapLegendMid")}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-teal-200" />
            {t("mapLegendLow")}
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("tableTitle")}</h2>
        <PropertyDistrictTable locale={locale} />
      </section>

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
