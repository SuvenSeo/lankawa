import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProvinceCard } from "@/components/ProvinceCard";
import { PROVINCES } from "@/lib/provinces";

export default async function ProvincesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("provinces");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVINCES.map((province) => (
          <ProvinceCard key={province.slug} province={province} locale={locale} />
        ))}
      </div>
    </div>
  );
}
