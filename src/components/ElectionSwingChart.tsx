"use client";

import { useTranslations } from "next-intl";
import {
  computeDistrictSwing,
  getBaselineCandidateColor,
  getPresidentialBaseline2020,
} from "@/lib/election-swing";
import {
  getCandidateColor,
  getElectionCandidate,
  getElectionDistrictResult,
} from "@/lib/elections";

export function ElectionSwingChart({ slug }: { slug: string }) {
  const t = useTranslations("swing");
  const swing = computeDistrictSwing(slug);
  const baseline = getPresidentialBaseline2020();
  const current = getElectionDistrictResult(slug);

  if (!swing || !current) {
    return null;
  }

  const baselineWinner = baseline.candidates.find(
    (candidate) => candidate.id === swing.baselineWinner,
  );
  const currentWinner = getElectionCandidate(swing.currentWinner);

  const bars = [
    {
      label: t("baselineLabel", { year: "2019" }),
      share: swing.baselineLeadingShare,
      color: getBaselineCandidateColor(swing.baselineWinner),
      party: baselineWinner?.party ?? swing.baselineWinner,
    },
    {
      label: t("currentLabel", { year: "2024" }),
      share: swing.currentLeadingShare,
      color: getCandidateColor(swing.currentWinner),
      party: currentWinner?.party ?? swing.currentWinner,
    },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("subtitle")}</p>
        </div>
        {swing.flipped ? (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
            {t("flipped")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-300">
                {bar.label} ·{" "}
                <span style={{ color: bar.color }}>{bar.party}</span>
              </span>
              <span className="font-medium text-white">{bar.share.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(bar.share, 100)}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">{t("winnerSwing")}</dt>
          <dd
            className={`mt-1 font-semibold ${
              swing.swingPoints >= 0 ? "text-teal-300" : "text-rose-300"
            }`}
          >
            {swing.swingPoints >= 0 ? "+" : ""}
            {swing.swingPoints.toFixed(1)} {t("points")}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t("nppFromSlpp")}</dt>
          <dd
            className={`mt-1 font-semibold ${
              swing.nppSwingFromSlpp >= 0 ? "text-teal-300" : "text-rose-300"
            }`}
          >
            {swing.nppSwingFromSlpp >= 0 ? "+" : ""}
            {swing.nppSwingFromSlpp.toFixed(1)} {t("points")}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function ProvinceSwingSummary({
  districtSlugs,
}: {
  districtSlugs: string[];
}) {
  const t = useTranslations("swing");
  const swings = districtSlugs
    .map((slug) => computeDistrictSwing(slug))
    .filter((swing) => swing != null);

  if (swings.length === 0) {
    return null;
  }

  const flipped = swings.filter((swing) => swing.flipped).length;
  const avgSwing =
    swings.reduce((sum, swing) => sum + swing.nppSwingFromSlpp, 0) /
    swings.length;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-medium text-white">{t("provinceSummary")}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">{t("districtsFlipped")}</dt>
          <dd className="mt-1 text-lg font-semibold text-white">
            {flipped} / {swings.length}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">{t("avgNppSwing")}</dt>
          <dd
            className={`mt-1 text-lg font-semibold ${
              avgSwing >= 0 ? "text-teal-300" : "text-rose-300"
            }`}
          >
            {avgSwing >= 0 ? "+" : ""}
            {avgSwing.toFixed(1)} {t("points")}
          </dd>
        </div>
      </dl>
    </article>
  );
}
