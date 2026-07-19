import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const platformLinks = [
  { href: "/about", key: "about" },
  { href: "/sources", key: "sources" },
  { href: "/developers", key: "developers" },
  { href: "/status", key: "status" },
] as const;

const exploreLinks = [
  { href: "/districts", key: "districts" },
  { href: "/elections", key: "elections" },
  { href: "/services", key: "services" },
  { href: "/economy", key: "economy" },
] as const;

const legalLinks = [{ href: "/about", key: "disclaimer" }] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 lg:col-span-1">
            <Link href="/" className="text-lg font-semibold text-white">
              Lankawa
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">{t("built")}</p>
            <p className="text-xs text-slate-600">
              {t("version", { version: "0.1.0" })}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-300">{t("platform")}</h2>
            <ul className="mt-3 space-y-2">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-teal-300"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-300">{t("explore")}</h2>
            <ul className="mt-3 space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-teal-300"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-300">{t("legal")}</h2>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition hover:text-teal-300"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-600">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
