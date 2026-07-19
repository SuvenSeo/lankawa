"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  PRESIDENTIAL_HISTORY_YEARS,
  computeCycleSwing,
  computeProvinceCycleSwing,
  getCandidateColorForCycle,
  getDistrictResultForCycle,
  getParliamentaryHistoryMeta,
  getPresidentialCycleByYear,
  getWinnerShare,
  type PresidentialHistoryYear,
} from "@/lib/election-history";
import { PROVINCES, getProvinceName } from "@/lib/provinces";

export function ElectionHistoryExplorer() {
  const t = useTranslations("electionHistory");
  const locale = useLocale();
  const [selectedYear, setSelectedYear] =
    useState<PresidentialHistoryYear>(2024);
  const [compareMode, setCompareMode] = useState<"district" | "province">(
    "district",
  );

  const cycle = getPresidentialCycleByYear(selectedYear);
  const yearIndex = PRESIDENTIAL_HISTORY_YEARS.indexOf(selectedYear);
  const priorYear =
    yearIndex > 0 ? PRESIDENTIAL_HISTORY_YEARS[yearIndex - 1] : null;

  const parliamentaryMeta = getParliamentaryHistoryMeta();

  const districtSwings = useMemo(() => {
    if (!priorYear) {
      return [];
    }
    return DISTRICTS.map((district) => ({
      district,
      swing: computeCycleSwing(district.slug, priorYear, selectedYear),
      result: cycle
        ? getDistrictResultForCycle(cycle, district.slug)
        : undefined,
    })).filter((item) => item.swing && item.result);
  }, [cycle, priorYear, selectedYear]);

  const provinceSwings = useMemo(() => {
    if (!priorYear) {
      return [];
    }
    return PROVINCES.map((province) => ({
      province,
      swing: computeProvinceCycleSwing(
        province.slug,
        priorYear,
        selectedYear,
      ),
    })).filter((item) => item.swing);
  }, [priorYear, selectedYear]);

  if (!cycle) {
    return null;
  }

  const winner = cycle.candidates.find(
    (candidate) => candidate.id === cycle.nationalWinner,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {PRESIDENTIAL_HISTORY_YEARS.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => setSelectedYear(year)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              selectedYear === year
                ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">{cycle.label}</h2>
        {winner ? (
          <p className="mt-2 text-slate-300">
            {t("nationalWinner")}:{" "}
            <span
              style={{
                color: getCandidateColorForCycle(cycle, winner.id),
              }}
            >
              {winner.name}
            </span>{" "}
            · {winner.party} · {winner.percentage.toFixed(1)}%
          </p>
        ) : null}
        <p className="mt-2 text-sm text-slate-500">
          {t("electionDate")}: {cycle.date} · {t("turnout")}:{" "}
          {cycle.turnout.toFixed(1)}%
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {cycle.candidates.map((candidate) => (
            <span
              key={candidate.id}
              className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs"
              style={{ color: getCandidateColorForCycle(cycle, candidate.id) }}
            >
              {candidate.party}: {candidate.percentage.toFixed(1)}%
            </span>
          ))}
        </div>
      </section>

      {priorYear ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {t("swingTitle", { from: priorYear, to: selectedYear })}
              </h2>
              <p className="text-sm text-slate-400">{t("swingSubtitle")}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCompareMode("district")}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  compareMode === "district"
                    ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {t("districtLevel")}
              </button>
              <button
                type="button"
                onClick={() => setCompareMode("province")}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  compareMode === "province"
                    ? "border-teal-400/50 bg-teal-500/20 text-teal-100"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                {t("provinceLevel")}
              </button>
            </div>
          </div>

          {compareMode === "district" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {districtSwings
                .sort(
                  (a, b) =>
                    Math.abs(b.swing!.swingPoints) -
                    Math.abs(a.swing!.swingPoints),
                )
                .slice(0, 12)
                .map(({ district, swing, result }) => {
                  if (!swing || !result) {
                    return null;
                  }
                  const winnerCandidate = cycle.candidates.find(
                    (c) => c.id === result.winner,
                  );
                  return (
                    <article
                      key={district.slug}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <Link
                        href={`/districts/${district.slug}`}
                        className="font-medium text-teal-200 hover:text-teal-100"
                      >
                        {getDistrictName(district, locale)}
                      </Link>
                      <p className="mt-2 text-sm text-slate-400">
                        {winnerCandidate?.party ?? result.winner} ·{" "}
                        {getWinnerShare(cycle, district.slug).toFixed(1)}%
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${
                          swing.swingPoints >= 0
                            ? "text-teal-300"
                            : "text-rose-300"
                        }`}
                      >
                        {swing.swingPoints >= 0 ? "+" : ""}
                        {swing.swingPoints.toFixed(1)} {t("points")}
                        {swing.flipped ? ` · ${t("flipped")}` : ""}
                      </p>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {provinceSwings.map(({ province, swing }) => {
                if (!swing) {
                  return null;
                }
                return (
                  <article
                    key={province.slug}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <Link
                      href={`/provinces/${province.slug}`}
                      className="font-medium text-teal-200 hover:text-teal-100"
                    >
                      {getProvinceName(province, locale)}
                    </Link>
                    <dl className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t("avgSwing")}</dt>
                        <dd
                          className={
                            swing.avgSwing >= 0
                              ? "text-teal-300"
                              : "text-rose-300"
                          }
                        >
                          {swing.avgSwing >= 0 ? "+" : ""}
                          {swing.avgSwing.toFixed(1)} {t("points")}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">{t("districtsFlipped")}</dt>
                        <dd className="text-white">
                          {swing.districtsFlipped} / {swing.districtCount}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {t("parliamentaryTitle")}
        </h2>
        <p className="text-sm text-slate-400">{t("parliamentarySubtitle")}</p>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("year")}</th>
                <th className="px-4 py-3 font-medium">{t("winner")}</th>
                <th className="px-4 py-3 font-medium text-right">
                  {t("seats")}
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  {t("turnout")}
                </th>
              </tr>
            </thead>
            <tbody>
              {parliamentaryMeta.cycles.map((entry) => (
                <tr key={entry.year} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">{entry.year}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {entry.winner ?? entry.note ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {entry.winnerSeats != null
                      ? `${entry.winnerSeats}/${entry.totalSeats}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {entry.turnout != null
                      ? `${entry.turnout.toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
