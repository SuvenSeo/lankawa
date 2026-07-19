import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDistrict, getDistrictName } from "@/lib/districts";
import {
  getParliamentaryDistrictResult,
  getElectionDistrictResult,
} from "@/lib/elections";
import {
  getProvince,
  getProvinceName,
  getDistrictsForProvince,
} from "@/lib/provinces";

export async function buildDistrictMetadata(
  locale: string,
  slug: string,
): Promise<Metadata> {
  const district = getDistrict(slug);
  const t = await getTranslations({ locale, namespace: "meta" });

  if (!district) {
    return { title: t("title") };
  }

  const name = getDistrictName(district, locale);
  return {
    title: `${name} — ${t("districtTitle")}`,
    description: t("districtDescription", {
      name,
      province: district.province,
      population: district.population.toLocaleString(),
    }),
  };
}

export async function buildProvinceMetadata(
  locale: string,
  slug: string,
): Promise<Metadata> {
  const province = getProvince(slug);
  const t = await getTranslations({ locale, namespace: "meta" });

  if (!province) {
    return { title: t("title") };
  }

  const name = getProvinceName(province, locale);
  const districts = getDistrictsForProvince(province);
  return {
    title: `${name} — ${t("provinceTitle")}`,
    description: t("provinceDescription", {
      name,
      count: districts.length,
    }),
  };
}

export async function buildPresidentialElectionMetadata(
  locale: string,
  slug: string,
): Promise<Metadata> {
  const district = getDistrict(slug);
  const result = getElectionDistrictResult(slug);
  const t = await getTranslations({ locale, namespace: "meta" });

  if (!district || !result) {
    return { title: t("title") };
  }

  const name = getDistrictName(district, locale);
  return {
    title: `${name} — ${t("electionPresidentialTitle")}`,
    description: t("electionPresidentialDescription", { name }),
  };
}

export async function buildParliamentaryElectionMetadata(
  locale: string,
  slug: string,
): Promise<Metadata> {
  const result = getParliamentaryDistrictResult(slug);
  const t = await getTranslations({ locale, namespace: "meta" });

  if (!result) {
    return { title: t("title") };
  }

  return {
    title: `${result.name} — ${t("electionParliamentaryTitle")}`,
    description: t("electionParliamentaryDescription", { name: result.name }),
  };
}
