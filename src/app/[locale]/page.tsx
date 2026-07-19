import { getTranslations, setRequestLocale } from "next-intl/server";
import { PulseCard } from "@/components/PulseCard";
import { HeroSection } from "@/components/HeroSection";
import { SourceHealthBar } from "@/components/SourceHealthBar";
import { Link } from "@/i18n/navigation";
import { buildPulseSnapshot, getTodayPulseMetrics } from "@/lib/pulse";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const snapshot = await buildPulseSnapshot();
  const todayMetrics = getTodayPulseMetrics(snapshot.metrics);

  return (
    <div className="space-y-12 md:space-y-16">
      <HeroSection metrics={todayMetrics} />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("pulseTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("pulseSubtitle")}</p>
          </div>
          <Link
            href="/disaster"
            className="text-sm font-medium text-teal-300 hover:text-teal-200"
          >
            {t("viewDisaster")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {todayMetrics.map((metric) => (
            <PulseCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="lk-card p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{t("exploreCtaTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{t("exploreCtaSubtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/explore" className="lk-btn-primary">
              {t("ctaExplore")}
            </Link>
            <Link href="/districts" className="lk-btn-secondary">
              {t("viewDistricts")}
            </Link>
          </div>
        </div>
      </section>

      <SourceHealthBar sources={snapshot.sources} />
    </div>
  );
}
