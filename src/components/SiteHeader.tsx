"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

const primaryLinks = [
  { href: "/districts", key: "districts" },
  { href: "/elections", key: "elections" },
  { href: "/economy", key: "economy" },
  { href: "/services", key: "services" },
] as const;

const moreLinks = [
  { href: "/provinces", key: "provinces" },
  { href: "/disaster", key: "disaster" },
  { href: "/budget", key: "budget" },
  { href: "/property", key: "property" },
  { href: "/transport", key: "transport" },
  { href: "/cost-of-living", key: "costOfLiving" },
  { href: "/health", key: "health" },
  { href: "/environment", key: "environment" },
  { href: "/compare", key: "compare" },
  { href: "/civic", key: "civic" },
  { href: "/tenders", key: "tenders" },
  { href: "/assistant", key: "assistant" },
  { href: "/status", key: "status" },
  { href: "/sources", key: "sources" },
  { href: "/developers", key: "developers" },
] as const;

const mobileSections = [
  {
    key: "explore",
    links: [
      { href: "/districts", key: "districts" },
      { href: "/provinces", key: "provinces" },
      { href: "/elections", key: "elections" },
      { href: "/compare", key: "compare" },
    ],
  },
  {
    key: "data",
    links: [
      { href: "/economy", key: "economy" },
      { href: "/budget", key: "budget" },
      { href: "/property", key: "property" },
      { href: "/health", key: "health" },
      { href: "/transport", key: "transport" },
      { href: "/environment", key: "environment" },
    ],
  },
  {
    key: "civic",
    links: [
      { href: "/services", key: "services" },
      { href: "/disaster", key: "disaster" },
      { href: "/civic", key: "civic" },
      { href: "/tenders", key: "tenders" },
      { href: "/assistant", key: "assistant" },
    ],
  },
  {
    key: "more",
    links: [
      { href: "/status", key: "status" },
      { href: "/sources", key: "sources" },
      { href: "/developers", key: "developers" },
      { href: "/about", key: "about" },
    ],
  },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? "bg-teal-500/20 text-teal-200"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

function MoreDropdown({ pathname }: { pathname: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreActive = moreLinks.some((link) => isActive(pathname, link.href));

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
          moreActive || open
            ? "bg-teal-500/20 text-teal-200"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        {t("more")}
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-xl backdrop-blur">
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-xl px-3 py-2 text-sm transition ${
                isActive(pathname, link.href)
                  ? "bg-teal-500/15 text-teal-100"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold text-white"
        >
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-sm text-teal-300 ring-1 ring-teal-500/30"
            aria-hidden="true"
          >
            L
          </span>
          Lankawa
        </Link>

        <nav className="hidden items-center gap-1 lg:flex lg:flex-1 lg:justify-center">
          {primaryLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={t(link.key)}
              active={isActive(pathname, link.href)}
            />
          ))}
          <MoreDropdown pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden w-44 xl:block xl:w-52">
            <GlobalSearch />
          </div>
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-slate-200 hover:bg-white/5 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 pb-3 lg:hidden">
        <GlobalSearch />
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 px-4 py-4 lg:hidden"
        >
          <div className="space-y-5">
            {mobileSections.map((section) => (
              <div key={section.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t(section.key)}
                </p>
                <div className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      label={t(link.key)}
                      active={isActive(pathname, link.href)}
                      onNavigate={() => setMenuOpen(false)}
                      className="block w-full text-left"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
