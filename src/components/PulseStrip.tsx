import { getTranslations } from "next-intl/server";
import { FreshnessBadge } from "@/components/FreshnessBadge";
import { Link } from "@/i18n/navigation";
import type { PulseMetric } from "@/lib/types";

const STRIP_IDS = ["usd_lkr", "fuel_petrol_92", "fuel_diesel", "flood_stations"] as const;

function pickStripMetrics(metrics: PulseMetric[]): PulseMetric[] {
  const picked: PulseMetric[] = [];
  for (const id of STRIP_IDS) {
    const metric = metrics.find((item) => item.id === id);
    if (metric) {
      picked.push(metric);
    }
  }
  return picked.slice(0, 4);
}

export async function PulseStrip({ metrics }: { metrics: PulseMetric[] }) {
  const t = await getTranslations("home");
  const stripMetrics = pickStripMetrics(metrics);

  if (stripMetrics.length === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap gap-2 sm:gap-3"
      role="list"
      aria-label={t("pulseStripLabel")}
    >
      {stripMetrics.map((metric) => (
        <Link
          key={metric.id}
          href={metric.provenancePath}
          role="listitem"
          className="group inline-flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 transition hover:border-teal-400/30 hover:bg-slate-950/80 sm:basis-auto sm:px-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className="truncate text-sm font-semibold text-white sm:text-base">
              {metric.value}
              {metric.unit ? (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  {metric.unit}
                </span>
              ) : null}
            </p>
          </div>
          <FreshnessBadge tier={metric.tier} />
        </Link>
      ))}
    </div>
  );
}
