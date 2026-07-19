import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocalGovernmentDirectory } from "@/components/LocalGovernmentDirectory";
import { Link } from "@/i18n/navigation";
import {
  countLocalGovernmentByType,
  getLocalGovernmentCatalog,
} from "@/lib/local-government";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function LocalGovernmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ district?: string; q?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("localGovernment");
  const catalog = getLocalGovernmentCatalog();
  const typeCounts = countLocalGovernmentByType();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-3 text-xs text-slate-500">
          {t("source")}:{" "}
          <Link
            href={getSourceProvenancePath(catalog.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {catalog.sourceName}
          </Link>
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("totalBodies")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {catalog.totalCount}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("typeMC")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {typeCounts.MC}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("typeUC")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {typeCounts.UC}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("typePS")}</dt>
          <dd className="mt-2 text-3xl font-semibold text-white">
            {typeCounts.PS}
          </dd>
        </div>
      </dl>

      <LocalGovernmentDirectory
        initialDistrict={filters.district}
        initialQuery={filters.q}
        totalCount={catalog.totalCount}
      />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
