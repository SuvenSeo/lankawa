"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function DistrictSearch({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized) {
      return [];
    }
    return DISTRICTS.filter((district) => {
      const haystack = [
        district.name,
        district.nameSi,
        district.nameTa,
        district.slug,
        district.province,
        district.capital,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    }).slice(0, 8);
  }, [query]);

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

  function navigateTo(slug: string) {
    setQuery("");
    setOpen(false);
    router.push(`/districts/${slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (results[activeIndex]) {
          navigateTo(results[activeIndex].slug);
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

  const containerClass =
    variant === "hero" ? "relative w-full" : "relative w-full max-w-xs";

  const inputClass =
    variant === "hero"
      ? "w-full rounded-full border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
      : "w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-2 focus:ring-teal-400/20";

  return (
    <div ref={containerRef} className={containerClass}>
      <label htmlFor="district-search" className="sr-only">
        {t("label")}
      </label>
      <input
        ref={inputRef}
        id="district-search"
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          results[activeIndex]
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
        className={inputClass}
      />

      {open && query && results.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-900 py-2 shadow-xl"
        >
          {results.map((district, index) => (
            <li key={district.slug} role="presentation">
              <Link
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                href={`/districts/${district.slug}`}
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`block px-4 py-2.5 text-sm transition ${
                  index === activeIndex
                    ? "bg-teal-500/15 text-teal-100"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                <span className="font-medium">{getDistrictName(district, locale)}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {district.province}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {open && query && results.length === 0 ? (
        <p className="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-xl">
          {t("noResults")}
        </p>
      ) : null}
    </div>
  );
}
