import { getTranslations } from "next-intl/server";
import { DistrictSearch } from "@/components/DistrictSearch";
import { PulseStrip } from "@/components/PulseStrip";
import { Link } from "@/i18n/navigation";
import type { PulseMetric } from "@/lib/types";

export async function HeroSection({ metrics }: { metrics: PulseMetric[] }) {
  const t = await getTranslations("home");

  return (
    <section className="hero-surface relative overflow-hidden rounded-3xl border border-white/10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.15),transparent_45%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:p-12">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400"
              aria-hidden="true"
            />
            {t("eyebrow")}
          </p>

          <div className="space-y-4">
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              {t("title")}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("subtitle")}
            </p>
            <p className="text-sm text-slate-500">{t("disclaimer")}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/districts"
              className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              {t("exploreDistricts")}
            </Link>
            <div className="w-full max-w-sm sm:w-auto sm:flex-1 sm:max-w-xs">
              <DistrictSearch variant="hero" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/economy"
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-slate-300 transition hover:border-teal-400/30 hover:bg-white/5 hover:text-white"
            >
              {t("ctaEconomy")}
            </Link>
            <Link
              href="/elections"
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-slate-300 transition hover:border-teal-400/30 hover:bg-white/5 hover:text-white"
            >
              {t("ctaElections")}
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-slate-300 transition hover:border-teal-400/30 hover:bg-white/5 hover:text-white"
            >
              {t("ctaServices")}
            </Link>
          </div>
        </div>

        <div className="space-y-3 lg:justify-self-end lg:w-full lg:max-w-md">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("pulseLive")}
          </p>
          <PulseStrip metrics={metrics} />
        </div>
      </div>
    </section>
  );
}
