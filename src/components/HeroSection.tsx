import { getTranslations } from "next-intl/server";
import { DistrictSearch } from "@/components/DistrictSearch";
import { PulseStrip } from "@/components/PulseStrip";
import { BrandMark } from "@/components/brand/BrandMark";
import { Link } from "@/i18n/navigation";
import type { PulseMetric } from "@/lib/types";

export async function HeroSection({ metrics }: { metrics: PulseMetric[] }) {
  const t = await getTranslations("home");

  return (
    <section className="hero-surface lk-brand-pattern relative overflow-hidden rounded-3xl border border-white/10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(13,148,136,0.18),transparent_45%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-8 h-48 w-48 rounded-full bg-[var(--lk-teal)]/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--lk-teal)]/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 opacity-[0.04]"
        aria-hidden="true"
      >
        <BrandMark size={280} />
      </div>

      <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:p-12">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lk-teal-bright)]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lk-teal-bright)]"
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
            <Link href="/districts" className="lk-btn-primary">
              {t("exploreDistricts")}
            </Link>
            <div className="w-full max-w-sm sm:w-auto sm:flex-1 sm:max-w-xs">
              <DistrictSearch variant="hero" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/explore" className="lk-btn-secondary">
              {t("ctaExplore")}
            </Link>
            <Link href="/disaster" className="lk-btn-secondary">
              {t("ctaDisaster")}
            </Link>
            <Link href="/economy" className="lk-btn-secondary">
              {t("ctaEconomy")}
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
