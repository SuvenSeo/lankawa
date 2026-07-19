import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchPowerStatus } from "@/lib/integrations/power";
import { buildPulseSnapshot } from "@/lib/pulse";

export default async function DisasterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("disaster");
  const [snapshot, power] = await Promise.all([
    buildPulseSnapshot(),
    fetchPowerStatus(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("powerTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("powerSubtitle")}</p>
        </div>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{t("powerStatusLabel")}</p>
              <p className="mt-1 text-2xl font-semibold text-teal-300">
                {t(`powerStatus.${power.status}`)}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {t("powerObservedAt", {
                time: new Date(power.observedAt).toLocaleString(locale),
              })}
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-300">{power.summary}</p>
          {power.affectedAreas.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-200">
                {t("powerAffectedAreas")}
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {power.affectedAreas.map((area) => (
                  <li
                    key={area}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t("powerNoAffectedAreas")}</p>
          )}
          <p className="mt-4 text-xs text-slate-500">{t("powerSourceNote")}</p>
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("floodTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("floodSubtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {snapshot.flood.map((alert) => (
            <article
              key={alert.alertLevel}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {alert.alertLevel}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-teal-300">
                {alert.count}
              </p>
              <p className="mt-1 text-sm text-slate-400">{t("stations")}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
