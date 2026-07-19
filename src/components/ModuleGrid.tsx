"use client";

import clsx from "clsx";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const modules = [
  {
    href: "/districts",
    key: "districts",
    icon: (
      <path
        d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/elections",
    key: "elections",
    icon: (
      <path
        d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/economy",
    key: "economy",
    icon: (
      <>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </>
    ),
  },
  {
    href: "/property",
    key: "property",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
  },
  {
    href: "/health",
    key: "health",
    icon: (
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/transport",
    key: "transport",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-2M16 16H6M6 16a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
      </>
    ),
  },
  {
    href: "/budget",
    key: "budget",
    icon: (
      <>
        <path d="M21 12V7H5a2 2 0 010-4h14v4" />
        <path d="M3 5v14a2 2 0 002 2h16v-5" />
        <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
      </>
    ),
  },
  {
    href: "/compare",
    key: "compare",
    icon: (
      <>
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </>
    ),
  },
] as const;

export function ModuleGrid() {
  const t = useTranslations("modules");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((module) => (
        <Link
          key={module.href}
          href={module.href}
          className={clsx(
            "group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition",
            "hover:border-teal-400/25 hover:bg-white/[0.06]",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/20 transition group-hover:bg-teal-500/15">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden="true"
            >
              {module.icon}
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-white">{t(`${module.key}.title`)}</span>
            <span className="mt-0.5 block text-sm leading-snug text-slate-400">
              {t(`${module.key}.description`)}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
