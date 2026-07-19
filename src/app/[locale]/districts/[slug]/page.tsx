import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DistrictMapLazy } from "@/components/DistrictMapLazy";
import { ElectionSwingChart } from "@/components/ElectionSwingChart";
import { FloodSparklinePanel } from "@/components/FloodSparklinePanel";
import { FloodStationList } from "@/components/FloodStationList";
import { VanniCrosswalkNotice } from "@/components/VanniCrosswalkNotice";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, getDistrict, getDistrictName } from "@/lib/districts";
import {
  getPopulationDensity,
  getProvinceDistrictCount,
  getProvincePopulationShare,
} from "@/lib/district-stats";
import {
  getDistrictWinnerPercentage,
  getElectionCandidate,
  getElectionDistrictResult,
  getCandidateColor,
  getParliamentaryDistrictForAdminDistrict,
  getParliamentaryParty,
  getPartyColor,
} from "@/lib/elections";
import { getFloodStationsForDistrict } from "@/lib/flood-districts";
import { fetchFloodLevelsForDistrict } from "@/lib/integrations/flood";
import { buildDistrictMetadata } from "@/lib/metadata";
import {
  getProvinceForDistrict,
  getProvinceName,
  getProvinceSlugFromDistrictProvince,
} from "@/lib/provinces";
import { getPublicServicesForDistrict } from "@/lib/services";
import { isVanniAdminDistrict } from "@/lib/election-swing";

export async function generateStaticParams() {
  return DISTRICTS.map((district) => ({ slug: district.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildDistrictMetadata(locale, slug);
}

export default async function DistrictDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("districts");
  const district = getDistrict(slug);

  if (!district) {
    notFound();
  }

  const density = getPopulationDensity(district);
  const provinceCount = getProvinceDistrictCount(district.province, DISTRICTS);
  const provinceShare = getProvincePopulationShare(district, DISTRICTS);
  const electionResult = getElectionDistrictResult(slug);
  const parliamentaryResult = getParliamentaryDistrictForAdminDistrict(slug);
  const floodStationNames = getFloodStationsForDistrict(slug);
  const province = getProvinceForDistrict(district);
  const services = getPublicServicesForDistrict(slug);

  let liveFloodStations: Awaited<ReturnType<typeof fetchFloodLevelsForDistrict>> = [];
  try {
    liveFloodStations = await fetchFloodLevelsForDistrict(slug);
  } catch {
    liveFloodStations = [];
  }

  const electionWinner = electionResult
    ? getElectionCandidate(electionResult.winner)
    : undefined;
  const winnerPct = electionResult
    ? getDistrictWinnerPercentage(electionResult)
    : 0;
  const parliamentaryWinner = parliamentaryResult
    ? getParliamentaryParty(parliamentaryResult.winner)
    : undefined;

  return (
    <div className="space-y-8">
      <Link href="/districts" className="text-sm text-teal-300 hover:text-teal-200">
        ← {t("back")}
      </Link>

      <div>
        <h1 className="text-3xl font-semibold text-white">
          {getDistrictName(district, locale)}
        </h1>
        {province ? (
          <p className="mt-2 text-slate-400">
            <Link
              href={`/provinces/${province.slug}`}
              className="text-teal-300 hover:text-teal-200"
            >
              {getProvinceName(province, locale)}
            </Link>{" "}
            {t("province")}
          </p>
        ) : (
          <p className="mt-2 text-slate-400">
            {district.province} {t("province")}
          </p>
        )}
      </div>

      <DistrictMapLazy
        locale={locale}
        highlightSlug={slug}
        height={280}
        interactive={false}
      />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("population")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.population.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("area")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.areaSqKm.toLocaleString()} km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("density")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {density.toLocaleString()} /km²
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("province")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {province ? (
              <Link
                href={`/provinces/${getProvinceSlugFromDistrictProvince(district.province)}`}
                className="hover:text-teal-200"
              >
                {getProvinceName(province, locale)}
              </Link>
            ) : (
              district.province
            )}
          </dd>
          <dd className="mt-1 text-xs text-slate-500">
            {t("provinceContext", {
              count: provinceCount,
              share: provinceShare.toFixed(1),
            })}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <dt className="text-sm text-slate-500">{t("capital")}</dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {district.capital}
          </dd>
        </div>
        {electionResult && electionWinner ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("election2024")}</dt>
            <dd
              className="mt-2 text-lg font-semibold"
              style={{ color: getCandidateColor(electionResult.winner) }}
            >
              {electionWinner.party}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">
              {winnerPct.toFixed(1)}% · {t("firstPreference")}
            </dd>
          </div>
        ) : null}
        {parliamentaryResult && parliamentaryWinner ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <dt className="text-sm text-slate-500">{t("parliamentary2024")}</dt>
            <dd
              className="mt-2 text-lg font-semibold"
              style={{ color: getPartyColor(parliamentaryWinner.id) }}
            >
              {parliamentaryWinner.abbreviation}
            </dd>
            <dd className="mt-1 text-xs text-slate-500">
              {parliamentaryResult.seats[parliamentaryResult.winner]}/
              {parliamentaryResult.totalSeats} {t("seats")}
            </dd>
          </div>
        ) : null}
      </dl>

      <FloodStationList
        stations={liveFloodStations}
        title={t("liveFloodTitle")}
        emptyMessage={
          floodStationNames.length > 0
            ? t("liveFloodUnavailable")
            : t("liveFloodNone")
        }
      />

      <FloodSparklinePanel stationNames={floodStationNames} />

      {electionResult ? <ElectionSwingChart slug={slug} /> : null}

      {isVanniAdminDistrict(slug) ? (
        <VanniCrosswalkNotice districtSlug={slug} />
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("relatedTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {province ? (
            <Link
              href={`/provinces/${province.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedProvince")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedProvinceDesc")}
              </p>
            </Link>
          ) : null}
          {electionResult ? (
            <Link
              href={`/elections/${slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedElections")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedElectionsDesc")}
              </p>
            </Link>
          ) : null}
          {parliamentaryResult ? (
            <Link
              href={`/elections/parliamentary/${parliamentaryResult.slug}`}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
            >
              <p className="font-medium text-white">{t("relatedParliamentary")}</p>
              <p className="mt-1 text-sm text-slate-400">
                {t("relatedParliamentaryDesc")}
              </p>
            </Link>
          ) : null}
          <Link
            href="/disaster"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedDisaster")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {floodStationNames.length > 0
                ? t("relatedDisasterStations", { count: floodStationNames.length })
                : t("relatedDisasterDesc")}
            </p>
          </Link>
          <Link
            href={`/services?district=${slug}`}
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedServices")}</p>
            <p className="mt-1 text-sm text-slate-400">
              {services.length > 0
                ? t("relatedServicesCount", { count: services.length })
                : t("relatedServicesDesc")}
            </p>
          </Link>
          <Link
            href="/economy"
            className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-teal-400/30 hover:bg-white/10"
          >
            <p className="font-medium text-white">{t("relatedEconomy")}</p>
            <p className="mt-1 text-sm text-slate-400">{t("relatedEconomyDesc")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
