import { getTranslations, setRequestLocale } from "next-intl/server";
import { PulseCard } from "@/components/PulseCard";
import { DistrictGrid } from "@/components/DistrictCard";
import { HeroSection } from "@/components/HeroSection";
import { ModuleGrid } from "@/components/ModuleGrid";
import { SourceHealthBar } from "@/components/SourceHealthBar";
import { Link } from "@/i18n/navigation";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const snapshot = await buildPulseSnapshot();

  return (
    <div className="space-y-12 md:space-y-16">
      <HeroSection metrics={snapshot.metrics} />

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t("modulesTitle")}</h2>
          <p className="mt-2 text-slate-400">{t("modulesSubtitle")}</p>
        </div>
        <ModuleGrid />
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("pulseTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("pulseSubtitle")}</p>
          </div>
          <Link
            href="/economy"
            className="text-sm font-medium text-teal-300 hover:text-teal-200"
          >
            {t("viewEconomy")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.metrics.map((metric) => (
            <PulseCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {t("districtsTitle")}
            </h2>
            <p className="mt-2 text-slate-400">{t("districtsSubtitle")}</p>
          </div>
          <Link
            href="/districts"
            className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-teal-400"
          >
            {t("viewDistricts")}
          </Link>
        </div>
        <DistrictGrid locale={locale} limit={6} />
      </section>

      <SourceHealthBar sources={snapshot.sources} />
    </div>
  );
}
