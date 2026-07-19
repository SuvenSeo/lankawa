import servicesData from "@/data/services-seed.json";
import type { PublicServiceFacility, PublicServiceType } from "./types";

const catalog = servicesData as {
  sourceId: string;
  sourceName: string;
  facilities: PublicServiceFacility[];
};

export function getPublicServicesCatalog() {
  return catalog;
}

export function getAllPublicServices(): PublicServiceFacility[] {
  return catalog.facilities;
}

export function getPublicServicesForDistrict(
  slug: string,
): PublicServiceFacility[] {
  return catalog.facilities.filter((facility) => facility.districtSlug === slug);
}

export function getPublicServiceName(
  facility: PublicServiceFacility,
  locale: string,
): string {
  if (locale === "si" && facility.nameSi) {
    return facility.nameSi;
  }
  if (locale === "ta" && facility.nameTa) {
    return facility.nameTa;
  }
  return facility.name;
}

export function getSeededDistrictSlugs(): string[] {
  return [...new Set(catalog.facilities.map((facility) => facility.districtSlug))];
}

export function searchPublicServices(
  query: string,
  locale: string,
): PublicServiceFacility[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return catalog.facilities.filter((facility) => {
    const haystack = [
      facility.name,
      facility.nameSi ?? "",
      facility.nameTa ?? "",
      facility.address,
      facility.type,
      facility.districtSlug,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getServiceTypeLabelKey(type: PublicServiceType): string {
  switch (type) {
    case "hospital":
      return "typeHospital";
    case "school":
      return "typeSchool";
    case "gn_office":
      return "typeGnOffice";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
