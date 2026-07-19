"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GlobalSearch } from "@/components/GlobalSearch";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

const links = [
  { href: "/", key: "home" },
  { href: "/districts", key: "districts" },
  { href: "/provinces", key: "provinces" },
  { href: "/elections", key: "elections" },
  { href: "/services", key: "services" },
  { href: "/disaster", key: "disaster" },
  { href: "/economy", key: "economy" },
  { href: "/sources", key: "sources" },
  { href: "/developers", key: "developers" },
] as const;

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useTranslations("nav");

  return (
    <>
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              active
                ? "bg-teal-500/20 text-teal-200"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            } ${className ?? ""}`}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          Lankawa
        </Link>

        <div className="order-3 w-full md:order-none md:mx-4 md:w-auto md:max-w-xs md:flex-1">
          <GlobalSearch />
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 p-2 text-slate-200 hover:bg-white/5 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {menuOpen ? t("closeMenu") : t("openMenu")}
            </span>
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

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
              className="block w-full text-left"
            />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
