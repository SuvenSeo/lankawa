import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ElectionResultBars } from "@/components/ElectionCards";
import { Link } from "@/i18n/navigation";
import { getDistrict, getDistrictName } from "@/lib/districts";
import {
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getElectionDistrictResult,
  getPresidentialElection2024,
  getCandidateColor,
} from "@/lib/elections";
import { buildPresidentialElectionMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  const election = getPresidentialElection2024();
  return election.districts.map((district) => ({ slug: district.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildPresidentialElectionMetadata(locale, slug);
}

export default async function ElectionDistrictPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("elections");
  const district = getDistrict(slug);
  const result = getElectionDistrictResult(slug);

  if (!district || !result) {
    notFound();
  }

  const winner = getElectionCandidate(result.winner);
  const winnerPct = getDistrictWinnerPercentage(result);
  const election = getPresidentialElection2024();

  return (
    <div className="space-y-6">
      <Link href="/elections" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getDistrictName(district, locale)}
        </h1>
        <p className="mt-2 text-slate-400">
          {t("districtSubtitle")} · {election.date}
        </p>
      </div>

      {result.note ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {result.note}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{t("districtWinner")}</p>
          {winner ? (
            <p
              className="mt-2 text-xl font-semibold"
              style={{ color: getCandidateColor(winner.id) }}
            >
              {winner.name}
            </p>
          ) : null}
          <p className="mt-1 text-sm text-slate-400">
            {winner?.party} · {winnerPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-500">{t("validVotes")}</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {result.validVotes.toLocaleString()}
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
        <h2 className="text-lg font-semibold text-white">{t("voteBreakdown")}</h2>
        <div className="mt-4">
          <ElectionResultBars result={result} />
        </div>
      </section>

      <Link
        href={`/districts/${slug}`}
        className="inline-flex text-sm text-teal-300 hover:text-teal-200"
      >
        {t("viewDistrict")} →
      </Link>
    </div>
  );
}
