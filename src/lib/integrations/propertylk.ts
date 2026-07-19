import { getPropertySnapshot } from "@/lib/property";
import type { PropertySnapshot } from "@/lib/types";

const PROPERTYLK_BASE_URL =
  process.env.PROPERTYLK_API_URL ??
  "https://property-price-intelligence-an-ardeno-production.fly.dev";

const FETCH_TIMEOUT_MS = 5000;

export async function fetchPropertySnapshot(): Promise<PropertySnapshot | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${PROPERTYLK_BASE_URL}/api/v1/districts`, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<PropertySnapshot>;
    if (!payload.districts?.length) {
      return null;
    }

    return {
      ...getPropertySnapshot(),
      ...payload,
      sourceId: "propertylk_api",
      sourceName: "PropertyLK Price Intelligence",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPropertyData(): Promise<PropertySnapshot> {
  const live = await fetchPropertySnapshot();
  return live ?? getPropertySnapshot();
}
