import { DISTRICTS, getDistrictName } from "./districts";
import type { District } from "./types";

export interface Province {
  slug: string;
  name: string;
  nameSi: string;
  nameTa: string;
}

export const PROVINCES: Province[] = [
  {
    slug: "western",
    name: "Western",
    nameSi: "බස්නාහිර",
    nameTa: "மேல்",
  },
  {
    slug: "central",
    name: "Central",
    nameSi: "මධ්‍ය",
    nameTa: "மத்திய",
  },
  {
    slug: "southern",
    name: "Southern",
    nameSi: "දකුණ",
    nameTa: "தென்",
  },
  {
    slug: "northern",
    name: "Northern",
    nameSi: "උතුර",
    nameTa: "வடக்கு",
  },
  {
    slug: "eastern",
    name: "Eastern",
    nameSi: "නැගෙනහිර",
    nameTa: "கிழக்கு",
  },
  {
    slug: "north-western",
    name: "North Western",
    nameSi: "වයඹ",
    nameTa: "வட மேல்",
  },
  {
    slug: "north-central",
    name: "North Central",
    nameSi: "උතුරු මධ්‍ය",
    nameTa: "வட மத்திய",
  },
  {
    slug: "uva",
    name: "Uva",
    nameSi: "ඌව",
    nameTa: "ஊவா",
  },
  {
    slug: "sabaragamuwa",
    name: "Sabaragamuwa",
    nameSi: "සබaragamuwa",
    nameTa: "சபரகமுவ",
  },
];

/** Maps province display name (as used on districts) to province slug. */
const PROVINCE_NAME_TO_SLUG: Record<string, string> = {
  Western: "western",
  Central: "central",
  Southern: "southern",
  Northern: "northern",
  Eastern: "eastern",
  "North Western": "north-western",
  "North Central": "north-central",
  Uva: "uva",
  Sabaragamuwa: "sabaragamuwa",
};

export function getProvinceSlugFromDistrictProvince(provinceName: string): string {
  return PROVINCE_NAME_TO_SLUG[provinceName] ?? provinceName.toLowerCase().replace(/\s+/g, "-");
}

export function getProvince(slug: string): Province | undefined {
  return PROVINCES.find((province) => province.slug === slug);
}

export function getProvinceName(province: Province, locale: string): string {
  if (locale === "si") {
    return province.nameSi;
  }
  if (locale === "ta") {
    return province.nameTa;
  }
  return province.name;
}

export function getDistrictsForProvince(province: Province): District[] {
  return DISTRICTS.filter(
    (district) =>
      getProvinceSlugFromDistrictProvince(district.province) === province.slug,
  );
}

export function getProvinceForDistrict(district: District): Province | undefined {
  const slug = getProvinceSlugFromDistrictProvince(district.province);
  return getProvince(slug);
}

export function getProvincePopulation(districts: District[]): number {
  return districts.reduce((sum, district) => sum + district.population, 0);
}

export function getProvinceArea(districts: District[]): number {
  return districts.reduce((sum, district) => sum + district.areaSqKm, 0);
}

export function getProvinceDensity(districts: District[]): number {
  const area = getProvinceArea(districts);
  if (area === 0) {
    return 0;
  }
  return Math.round(getProvincePopulation(districts) / area);
}

export function getProvinceDistrictLabel(
  districts: District[],
  locale: string,
): string {
  return districts
    .map((district) => getDistrictName(district, locale))
    .join(", ");
}
