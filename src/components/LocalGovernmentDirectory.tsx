"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  filterLocalGovernment,
  getLocalGovernmentName,
  getLocalGovernmentTypeLabelKey,
} from "@/lib/local-government";
import type { LocalGovernmentType } from "@/lib/types";

const ALL_TYPES: LocalGovernmentType[] = ["MC", "UC", "PS"];

export function LocalGovernmentDirectory({
  initialDistrict,
  initialQuery,
  totalCount,
}: {
  initialDistrict?: string;
  initialQuery?: string;
  totalCount: number;
}) {
  const t = useTranslations("localGovernment");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [districtFilter, setDistrictFilter] = useState(initialDistrict ?? "all");
  const [typeFilter, setTypeFilter] = useState<LocalGovernmentType | "all">("all");

  const filtered = useMemo(
    () =>
      filterLocalGovernment({
        district: districtFilter === "all" ? undefined : districtFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        query,
      }),
    [districtFilter, query, typeFilter],
  );

  const groupedByDistrict = useMemo(() => {
    const groups = new Map<string, typeof filtered>();
    for (const body of filtered) {
      const existing = groups.get(body.districtSlug) ?? [];
      existing.push(body);
      groups.set(body.districtSlug, existing);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        {t("catalogCount", { count: totalCount })}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none sm:max-w-xs"
        />
        <select
          value={districtFilter}
          onChange={(event) => setDistrictFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="all">{t("allDistricts")}</option>
          {DISTRICTS.map((district) => (
            <option key={district.slug} value={district.slug}>
              {getDistrictName(district, locale)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as LocalGovernmentType | "all")
          }
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="all">{t("allTypes")}</option>
          {ALL_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(getLocalGovernmentTypeLabelKey(type))}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-400">
        {t("resultsCount", { count: filtered.length })}
      </p>

      <div className="space-y-6">
        {groupedByDistrict.map(([districtSlug, bodies]) => {
          const district = DISTRICTS.find((item) => item.slug === districtSlug);
          return (
            <section key={districtSlug} className="space-y-3">
              <h3 className="text-lg font-medium text-white">
                {district ? (
                  <Link
                    href={`/districts/${district.slug}`}
                    className="text-teal-200 hover:text-teal-100"
                  >
                    {getDistrictName(district, locale)}
                  </Link>
                ) : (
                  districtSlug
                )}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({bodies.length})
                </span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {bodies.map((body) => (
                  <article
                    key={body.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-sm font-medium text-white">
                      {getLocalGovernmentName(body, locale)}
                    </p>
                    <span className="mt-2 inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs text-teal-100">
                      {t(getLocalGovernmentTypeLabelKey(body.type))}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
          {t("noResults")}
        </p>
      ) : null}
    </div>
  );
}
