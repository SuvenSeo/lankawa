import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ParliamentarySeatBars } from "@/components/ParliamentaryCards";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrictName } from "@/lib/districts";
import {
  getParliamentaryDistrictResult,
  getParliamentaryElection2024,
  getParliamentaryParty,
  getPartyColor,
} from "@/lib/elections";
import { buildParliamentaryElectionMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  const election = getParliamentaryElection2024();
  return election.districts.map((district) => ({ slug: district.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildParliamentaryElectionMetadata(locale, slug);
}

export default async function ParliamentaryDistrictPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("elections");
  const result = getParliamentaryDistrictResult(slug);
  const election = getParliamentaryElection2024();

  if (!result) {
    notFound();
  }

  const winner = getParliamentaryParty(result.winner);
  const adminDistricts = result.districtSlugs
    .map((adminSlug) => DISTRICTS.find((district) => district.slug === adminSlug))
    .filter((district) => district != null);

  return (
    <div className="space-y-6">
      <Link
        href="/elections?type=parliamentary"
        className="text-sm text-teal-300 hover:text-teal-200"
      >
        ← {t("backParliamentary")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">{result.name}</h1>
        <p className="mt-2 text-slate-400">
          {t("parliamentaryDistrictSubtitle")} · {election.date}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{t("districtWinner")}</p>
          {winner ? (
            <p
              className="mt-2 text-xl font-semibold"
              style={{ color: getPartyColor(winner.id) }}
            >
              {winner.abbreviation}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-slate-400">
            {result.seats[result.winner]}/{result.totalSeats} {t("seats")}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{t("totalSeats")}</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {result.totalSeats}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{t("turnout")}</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {result.turnout.toFixed(2)}%
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">{t("seatBreakdown")}</h2>
        <div className="mt-4">
          <ParliamentarySeatBars result={result} />
        </div>
      </section>

      {adminDistricts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">{t("adminDistricts")}</h2>
          <div className="flex flex-wrap gap-2">
            {adminDistricts.map((district) => (
              <Link
                key={district.slug}
                href={`/districts/${district.slug}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 hover:border-teal-400/30 hover:text-teal-100"
              >
                {getDistrictName(district, locale)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
