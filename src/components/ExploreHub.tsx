import { getTranslations } from "next-intl/server";
import { ArdenoStackGrid } from "@/components/ArdenoStackGrid";
import { DistrictGrid } from "@/components/DistrictCard";
import { exploreSections, ModuleGrid } from "@/components/ModuleGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { NewsPulse } from "@/components/NewsPulse";
import { buildArdenoModuleCards, getLifeOverview } from "@/lib/life";

export async function ExploreHub({ locale }: { locale: string }) {
  const t = await getTranslations("explore");
  const overview = await getLifeOverview();
  const ardenoModules = buildArdenoModuleCards(overview);

  return (
    <div className="space-y-12 md:space-y-16">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <ModuleGrid sections={exploreSections} />

      <NewsPulse />

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("ardenoTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("ardenoSubtitle")}</p>
          </div>
          <Link
            href="/ardeno"
            className="lk-btn-primary"
          >
            {t("viewArdeno")}
          </Link>
        </div>
        <ArdenoStackGrid modules={ardenoModules.slice(0, 4)} />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("districtsTitle")}</h2>
            <p className="mt-2 text-slate-400">{t("districtsSubtitle")}</p>
          </div>
          <Link
            href="/districts"
            className="lk-btn-primary"
          >
            {t("viewDistricts")}
          </Link>
        </div>
        <DistrictGrid locale={locale} limit={6} />
      </section>
    </div>
  );
}
