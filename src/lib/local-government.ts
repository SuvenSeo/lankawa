import localGovData from "@/data/local-government.json";
import type { LocalGovernmentBody, LocalGovernmentType } from "./types";

const catalog = localGovData as {
  sourceId: string;
  sourceName: string;
  asOf: string;
  totalCount: number;
  bodies: LocalGovernmentBody[];
};

export function getLocalGovernmentCatalog() {
  return catalog;
}

export function getAllLocalGovernmentBodies(): LocalGovernmentBody[] {
  return catalog.bodies;
}

export function getLocalGovernmentName(
  body: LocalGovernmentBody,
  locale: string,
): string {
  if (locale === "si" && body.nameSi) {
    return body.nameSi;
  }
  if (locale === "ta" && body.nameTa) {
    return body.nameTa;
  }
  return body.name;
}

export function getLocalGovernmentForDistrict(
  slug: string,
): LocalGovernmentBody[] {
  return catalog.bodies.filter((body) => body.districtSlug === slug);
}

export function filterLocalGovernment(filters: {
  district?: string;
  type?: LocalGovernmentType;
  query?: string;
}): LocalGovernmentBody[] {
  const normalized = filters.query?.trim().toLowerCase() ?? "";

  return catalog.bodies.filter((body) => {
    if (filters.district && body.districtSlug !== filters.district) {
      return false;
    }
    if (filters.type && body.type !== filters.type) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [
      body.name,
      body.nameSi ?? "",
      body.nameTa ?? "",
      body.type,
      body.districtSlug,
      body.province,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function getLocalGovernmentTypeLabelKey(
  type: LocalGovernmentType,
): string {
  switch (type) {
    case "MC":
      return "typeMC";
    case "UC":
      return "typeUC";
    case "PS":
      return "typePS";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function countLocalGovernmentByType(): Record<LocalGovernmentType, number> {
  return catalog.bodies.reduce(
    (acc, body) => {
      acc[body.type] = (acc[body.type] ?? 0) + 1;
      return acc;
    },
    { MC: 0, UC: 0, PS: 0 } as Record<LocalGovernmentType, number>,
  );
}
