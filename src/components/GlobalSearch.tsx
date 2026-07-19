"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  getParliamentaryElection2024,
  getPresidentialElection2024,
} from "@/lib/elections";
import { PROVINCES, getProvinceName } from "@/lib/provinces";
import {
  getAllPublicServices,
  getPublicServiceName,
} from "@/lib/services";

type SearchResult =
  | { type: "district"; slug: string; label: string; meta: string; href: string }
  | { type: "province"; slug: string; label: string; meta: string; href: string }
  | { type: "election"; slug: string; label: string; meta: string; href: string }
  | { type: "service"; slug: string; label: string; meta: string; href: string };

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function buildSearchIndex(locale: string): SearchResult[] {
  const presidential = getPresidentialElection2024();
  const parliamentary = getParliamentaryElection2024();
  const results: SearchResult[] = [];

  for (const district of DISTRICTS) {
    results.push({
      type: "district",
      slug: district.slug,
      label: getDistrictName(district, locale),
      meta: district.province,
      href: `/districts/${district.slug}`,
    });
  }

  for (const province of PROVINCES) {
    results.push({
      type: "province",
      slug: province.slug,
      label: getProvinceName(province, locale),
      meta: "Province",
      href: `/provinces/${province.slug}`,
    });
  }

  for (const district of presidential.districts) {
    const admin = DISTRICTS.find((item) => item.slug === district.slug);
    if (!admin) {
      continue;
    }
    results.push({
      type: "election",
      slug: `presidential-${district.slug}`,
      label: getDistrictName(admin, locale),
      meta: "Presidential 2024",
      href: `/elections/${district.slug}`,
    });
  }

  for (const district of parliamentary.districts) {
    results.push({
      type: "election",
      slug: `parliamentary-${district.slug}`,
      label: district.name,
      meta: "Parliamentary 2024",
      href: `/elections/parliamentary/${district.slug}`,
    });
  }

  results.push({
    type: "election",
    slug: "elections-presidential",
    label: "Presidential Election 2024",
    meta: "National results",
    href: "/elections?type=presidential",
  });
  results.push({
    type: "election",
    slug: "elections-parliamentary",
    label: "Parliamentary Election 2024",
    meta: "National results",
    href: "/elections?type=parliamentary",
  });

  for (const facility of getAllPublicServices()) {
    results.push({
      type: "service",
      slug: facility.id,
      label: getPublicServiceName(facility, locale),
      meta: facility.type.replace("_", " "),
      href: `/services?district=${facility.districtSlug}&q=${encodeURIComponent(facility.name)}`,
    });
  }

  return results;
}

export function GlobalSearch() {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const index = useMemo(() => buildSearchIndex(locale), [locale]);

  const results = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized) {
      return [];
    }
    return index
      .filter((item) => {
        const haystack = [item.label, item.meta, item.slug].join(" ").toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 12);
  }, [index, query]);

  const grouped = useMemo(() => {
    const groups: Record<SearchResult["type"], SearchResult[]> = {
      district: [],
      province: [],
      election: [],
      service: [],
    };
    for (const result of results) {
      groups[result.type].push(result);
    }
    return groups;
  }, [results]);

  const flatResults = useMemo(
    () => [
      ...grouped.district,
      ...grouped.province,
      ...grouped.election,
      ...grouped.service,
    ],
    [grouped],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateTo(href: string) {
    setQuery("");
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, flatResults.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (flatResults[activeIndex]) {
          navigateTo(flatResults[activeIndex].href);
        }
        break;
      case "Escape":
        setOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  }

  const groupLabels: Record<SearchResult["type"], string> = {
    district: t("groupDistricts"),
    province: t("groupProvinces"),
    election: t("groupElections"),
    service: t("groupServices"),
  };

  let optionIndex = -1;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <label htmlFor="global-search" className="sr-only">
        {t("label")}
      </label>
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        role="combobox"
        aria-expanded={open && flatResults.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          flatResults[activeIndex]
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        placeholder={t("placeholder")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
      />

      {open && query && flatResults.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-900 py-2 shadow-xl"
        >
          {(["district", "province", "election", "service"] as const).map(
            (type) => {
              const items = grouped[type];
              if (items.length === 0) {
                return null;
              }
              return (
                <li key={type} role="presentation">
                  <p className="px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {groupLabels[type]}
                  </p>
                  <ul>
                    {items.map((item) => {
                      optionIndex += 1;
                      const currentIndex = optionIndex;
                      return (
                        <li key={item.slug} role="presentation">
                          <Link
                            id={`${listboxId}-option-${currentIndex}`}
                            role="option"
                            aria-selected={currentIndex === activeIndex}
                            href={item.href}
                            onClick={() => {
                              setQuery("");
                              setOpen(false);
                            }}
                            onMouseEnter={() => setActiveIndex(currentIndex)}
                            className={`block px-4 py-2.5 text-sm transition ${
                              currentIndex === activeIndex
                                ? "bg-teal-500/15 text-teal-100"
                                : "text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <span className="font-medium">{item.label}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {item.meta}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            },
          )}
        </ul>
      ) : null}

      {open && query && flatResults.length === 0 ? (
        <p className="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-xl">
          {t("noResults")}
        </p>
      ) : null}
    </div>
  );
}
