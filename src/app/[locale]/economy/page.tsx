import { getTranslations, setRequestLocale } from "next-intl/server";
import { CseMarketCard } from "@/components/CseMarketCard";
import { FuelHistoryChart, FxSparkline, MacroIndicatorCard } from "@/components/EconomyCards";
import { PulseCard } from "@/components/PulseCard";
import { Link } from "@/i18n/navigation";
import { getEconomyMacroSnapshot, getFxSeries } from "@/lib/economy";
import { getFuelHistorySeries } from "@/lib/fuel";
import { buildCseSnapshot } from "@/lib/integrations/cse";
import { buildPulseSnapshot } from "@/lib/pulse";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function EconomyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("economy");
  const snapshot = await buildPulseSnapshot();
  const macro = getEconomyMacroSnapshot();
  const fxSeries = await getFxSeries();
  const fuelHistory = await getFuelHistorySeries(90);
  const cseSnapshot = await buildCseSnapshot();
  const economyMetrics = snapshot.metrics.filter((metric) =>
    ["usd_lkr", "fuel_petrol_92", "fuel_diesel"].includes(metric.id),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{t("liveTitle")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {economyMetrics.map((metric) => (
            <PulseCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("macroTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("macroSubtitle")} ·{" "}
            <Link
              href={getSourceProvenancePath(macro.sourceId)}
              className="text-teal-300 hover:text-teal-200"
            >
              {macro.sourceName}
            </Link>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {macro.indicators.map((indicator) => (
            <MacroIndicatorCard
              key={indicator.id}
              label={indicator.label}
              value={indicator.value}
              unit={indicator.unit}
              period={indicator.period}
              tier="stale"
            />
          ))}
          <FxSparkline
            title={t("fxSparklineTitle")}
            series={fxSeries}
            asOf={macro.asOf}
          />
          <FuelHistoryChart title={t("fuelHistoryTitle")} series={fuelHistory} />
        </div>
      </section>

      <CseMarketCard
        snapshot={cseSnapshot}
        labels={{
          title: t("cse.title"),
          subtitle: t("cse.subtitle"),
          sourceName: t("cse.sourceName"),
          aspi: t("cse.aspi"),
          snp: t("cse.snp"),
          gainers: t("cse.gainers"),
          losers: t("cse.losers"),
          marketStatus: t("cse.marketStatus"),
          trades: t("cse.trades"),
          shareVolume: t("cse.shareVolume"),
          turnover: t("cse.turnover"),
          fallbackNote: t("cse.fallbackNote"),
          noMovers: t("cse.noMovers"),
        }}
      />
    </div>
  );
}
