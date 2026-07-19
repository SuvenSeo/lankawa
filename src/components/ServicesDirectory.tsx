"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  getAllPublicServices,
  getPublicServiceName,
  getSeededDistrictSlugs,
  getServiceTypeLabelKey,
} from "@/lib/services";
import type { PublicServiceFacility, PublicServiceType } from "@/lib/types";

const ALL_TYPES: PublicServiceType[] = ["hospital", "school", "gn_office"];

export function ServicesDirectory({
  initialDistrict,
  initialQuery,
}: {
  initialDistrict?: string;
  initialQuery?: string;
}) {
  const t = useTranslations("services");
  const locale = useLocale();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [districtFilter, setDistrictFilter] = useState(initialDistrict ?? "all");
  const [typeFilter, setTypeFilter] = useState<PublicServiceType | "all">("all");

  const seededDistricts = getSeededDistrictSlugs();
  const facilities = getAllPublicServices();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return facilities.filter((facility) => {
      if (districtFilter !== "all" && facility.districtSlug !== districtFilter) {
        return false;
      }
      if (typeFilter !== "all" && facility.type !== typeFilter) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const haystack = [
        facility.name,
        facility.nameSi ?? "",
        facility.nameTa ?? "",
        facility.address,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [districtFilter, facilities, query, typeFilter]);

  const comingSoonDistricts = DISTRICTS.filter(
    (district) => !seededDistricts.includes(district.slug),
  );

  return (
    <div className="space-y-6">
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
          {seededDistricts.map((slug) => {
            const district = DISTRICTS.find((item) => item.slug === slug);
            if (!district) {
              return null;
            }
            return (
              <option key={slug} value={slug}>
                {getDistrictName(district, locale)}
              </option>
            );
          })}
        </select>
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as PublicServiceType | "all")
          }
          className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white"
        >
          <option value="all">{t("allTypes")}</option>
          {ALL_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(getServiceTypeLabelKey(type))}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-400">
        {t("resultsCount", { count: filtered.length })}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((facility) => (
          <ServiceCard key={facility.id} facility={facility} locale={locale} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-400">
          {t("noResults")}
        </p>
      ) : null}

      <section className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
        <h2 className="text-lg font-semibold text-white">{t("comingSoonTitle")}</h2>
        <p className="mt-2 text-sm text-slate-400">{t("comingSoonBody")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {comingSoonDistricts.slice(0, 12).map((district) => (
            <span
              key={district.slug}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500"
            >
              {getDistrictName(district, locale)}
            </span>
          ))}
          {comingSoonDistricts.length > 12 ? (
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500">
              +{comingSoonDistricts.length - 12}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ServiceCard({
  facility,
  locale,
}: {
  facility: PublicServiceFacility;
  locale: string;
}) {
  const t = useTranslations("services");
  const district = DISTRICTS.find((item) => item.slug === facility.districtSlug);

  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">
            {getPublicServiceName(facility, locale)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{facility.address}</p>
        </div>
        <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-xs text-teal-100">
          {t(getServiceTypeLabelKey(facility.type))}
        </span>
      </div>
      {district ? (
        <Link
          href={`/districts/${district.slug}`}
          className="mt-3 inline-flex text-xs text-teal-300 hover:text-teal-200"
        >
          {getDistrictName(district, locale)} →
        </Link>
      ) : null}
    </article>
  );
}
