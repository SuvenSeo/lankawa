import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ElectionDistrictRow } from "@/components/ElectionCards";
import { ElectionTypeTabs } from "@/components/ElectionTypeTabs";
import { ParliamentaryDistrictRow } from "@/components/ParliamentaryCards";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";
import {
  countDistrictsWonBy,
  countElectoralDistrictsWonBy,
  getCandidateColor,
  getElectionCandidate,
  getParliamentaryElection2024,
  getParliamentaryParty,
  getPartyColor,
  getPresidentialElection2024,
} from "@/lib/elections";
import { getSourceProvenancePath } from "@/lib/sources";

export default async function ElectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("elections");
  const activeType = type === "parliamentary" ? "parliamentary" : "presidential";

  if (activeType === "parliamentary") {
    const election = getParliamentaryElection2024();
    const winner = getParliamentaryParty(election.nationalWinner);
    const sortedDistricts = [...election.districts].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {t("parliamentaryTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            {t("parliamentarySubtitle")}
          </p>
        </div>

        <ElectionTypeTabs
          active="parliamentary"
          presidentialLabel={t("tabPresidential")}
          parliamentaryLabel={t("tabParliamentary")}
        />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">{t("nationalWinner")}</p>
              {winner ? (
                <>
                  <h2
                    className="mt-1 text-2xl font-semibold"
                    style={{ color: getPartyColor(winner.id) }}
                  >
                    {winner.name}
                  </h2>
                  <p className="mt-1 text-slate-400">
                    {winner.abbreviation} · {winner.totalSeats} {t("totalSeats")}{" "}
                    · {winner.percentage.toFixed(2)}%
                  </p>
                </>
              ) : null}
              <p className="mt-4 text-sm text-slate-500">
                {t("electionDate")}: {election.date} · {t("turnout")}:{" "}
                {election.turnout.toFixed(2)}%
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {election.parties.slice(0, 6).map((party) => (
                <div
                  key={party.id}
                  className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <dt className="text-slate-500">{party.abbreviation}</dt>
                  <dd
                    className="mt-1 text-lg font-semibold"
                    style={{ color: getPartyColor(party.id) }}
                  >
                    {party.totalSeats}
                  </dd>
                  <dd className="text-xs text-slate-500">
                    {countElectoralDistrictsWonBy(party.id)} {t("districtsWon")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {t("source")}:{" "}
            <Link
              href={getSourceProvenancePath(election.sourceId)}
              className="text-teal-300 hover:text-teal-200"
            >
              {election.sourceName}
            </Link>
            · {t("asOf", { date: election.date })}
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">{t("byDistrict")}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortedDistricts.map((result) => (
              <ParliamentaryDistrictRow key={result.slug} result={result} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const election = getPresidentialElection2024();
  const winner = getElectionCandidate(election.nationalWinner);
  const winnerBySlug = Object.fromEntries(
    election.districts.map((district) => [district.slug, district.winner]),
  );
  const sortedDistricts = [...election.districts].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <ElectionTypeTabs
        active="presidential"
        presidentialLabel={t("tabPresidential")}
        parliamentaryLabel={t("tabParliamentary")}
      />

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">{t("nationalWinner")}</p>
            {winner ? (
              <>
                <h2
                  className="mt-1 text-2xl font-semibold"
                  style={{ color: getCandidateColor(winner.id) }}
                >
                  {winner.name}
                </h2>
                <p className="mt-1 text-slate-400">
                  {winner.party} · {winner.percentage.toFixed(2)}%{" "}
                  {t("firstPreference")}
                  {winner.finalPercentage
                    ? ` · ${winner.finalPercentage.toFixed(2)}% ${t("afterPreferences")}`
                    : null}
                </p>
              </>
            ) : null}
            <p className="mt-4 text-sm text-slate-500">
              {t("electionDate")}: {election.date} · {t("turnout")}:{" "}
              {election.turnout.toFixed(2)}%
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {election.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
              >
                <dt className="text-slate-500">{candidate.party}</dt>
                <dd
                  className="mt-1 text-lg font-semibold"
                  style={{ color: getCandidateColor(candidate.id) }}
                >
                  {candidate.percentage.toFixed(1)}%
                </dd>
                <dd className="text-xs text-slate-500">
                  {countDistrictsWonBy(candidate.id)} {t("districtsWon")}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {t("source")}:{" "}
          <Link
            href={getSourceProvenancePath(election.sourceId)}
            className="text-teal-300 hover:text-teal-200"
          >
            {election.sourceName}
          </Link>
          · {t("asOf", { date: election.date })}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
        <DistrictMapLazy locale={locale} winnerBySlug={winnerBySlug} />
        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
          {election.candidates.map((candidate) => (
            <span key={candidate.id} className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: getCandidateColor(candidate.id) }}
              />
              {candidate.party}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("byDistrict")}</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDistricts.map((result) => (
            <ElectionDistrictRow
              key={result.slug}
              result={result}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
