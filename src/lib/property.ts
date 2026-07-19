import propertyData from "@/data/property-seed.json";
import type { PropertyDistrictPrice, PropertySnapshot } from "./types";

const snapshot = propertyData as PropertySnapshot;

export function getPropertySnapshot(): PropertySnapshot {
  return snapshot;
}

export function getPropertyDistrictPrice(
  slug: string,
): PropertyDistrictPrice | undefined {
  return snapshot.districts.find((district) => district.slug === slug);
}

export function getMaxPropertyMedian(): number {
  return Math.max(
    ...snapshot.districts.map((district) => district.medianPerPerch),
    1,
  );
}

export function getNationalMedianPerPerch(): number {
  const sorted = [...snapshot.districts].sort(
    (a, b) => a.medianPerPerch - b.medianPerPerch,
  );
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid]?.medianPerPerch ?? 0;
}

export function formatPropertyPrice(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

export function getPropertyPriceColor(median: number, maxMedian: number): string {
  const ratio = median / maxMedian;
  if (ratio >= 0.75) {
    return "#0f766e";
  }
  if (ratio >= 0.5) {
    return "#14b8a6";
  }
  if (ratio >= 0.3) {
    return "#2dd4bf";
  }
  if (ratio >= 0.15) {
    return "#5eead4";
  }
  return "#99f6e4";
}
