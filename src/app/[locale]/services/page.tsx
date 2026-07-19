import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesDirectory } from "@/components/ServicesDirectory";
import { getPublicServicesCatalog } from "@/lib/services";
import { getSourceProvenancePath } from "@/lib/sources";
import { Link } from "@/i18n/navigation";

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ district?: string; q?: string }>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const catalog = getPublicServicesCatalog();

  return (
    <div className="space-y-6">
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
      <ServicesDirectory
        initialDistrict={filters.district}
        initialQuery={filters.q}
      />
    </div>
  );
}
