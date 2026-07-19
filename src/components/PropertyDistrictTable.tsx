"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getDistrictName, getDistrict } from "@/lib/districts";
import {
  formatPropertyPrice,
  getMaxPropertyMedian,
  getPropertySnapshot,
} from "@/lib/property";

export function PropertyDistrictTable({ locale }: { locale: string }) {
  const t = useTranslations("property");
  const snapshot = getPropertySnapshot();
  const maxMedian = getMaxPropertyMedian();
  const sorted = [...snapshot.districts].sort(
    (a, b) => b.medianPerPerch - a.medianPerPerch,
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">{t("district")}</th>
            <th className="px-4 py-3 font-medium text-right">
              {t("medianPerPerch")}
            </th>
            <th className="px-4 py-3 font-medium text-right">
              {t("priceBand")}
            </th>
            <th className="px-4 py-3 font-medium text-right">{t("trend")}</th>
            <th className="px-4 py-3 font-medium">{t("intensity")}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const district = getDistrict(row.slug);
            const label = district ? getDistrictName(district, locale) : row.slug;
            return (
              <tr key={row.slug} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/districts/${row.slug}`}
                    className="font-medium text-teal-200 hover:text-teal-100"
                  >
                    {label}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-white">
                  LKR {row.medianPerPerch.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatPropertyPrice(row.lowBand)} –{" "}
                  {formatPropertyPrice(row.highBand)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    row.trendPct >= 0 ? "text-rose-300" : "text-teal-300"
                  }`}
                >
                  {row.trendPct >= 0 ? "+" : ""}
                  {row.trendPct.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-teal-400"
                      style={{
                        width: `${(row.medianPerPerch / maxMedian) * 100}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
