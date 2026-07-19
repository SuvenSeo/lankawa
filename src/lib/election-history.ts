import election2010 from "@/data/elections-presidential-2010.json";
import election2015 from "@/data/elections-presidential-2015.json";
import election2019 from "@/data/elections-presidential-2020-baseline.json";
import election2024 from "@/data/elections-presidential-2024.json";
import parliamentaryHistory from "@/data/elections-parliamentary-history.json";
import { PROVINCES, getDistrictsForProvince } from "./provinces";
import type {
  HistoricalPresidentialCycle,
  ParliamentaryHistoryCycle,
} from "./types";

const cycles: HistoricalPresidentialCycle[] = [
  election2010 as HistoricalPresidentialCycle,
  election2015 as HistoricalPresidentialCycle,
  {
    ...(election2019 as unknown as HistoricalPresidentialCycle),
    year: 2019,
    label: "2019 Presidential",
  },
  {
    ...(election2024 as unknown as HistoricalPresidentialCycle),
    year: 2024,
    label: "2024 Presidential",
  },
];

export const PRESIDENTIAL_HISTORY_YEARS = [2010, 2015, 2019, 2024] as const;
export type PresidentialHistoryYear = (typeof PRESIDENTIAL_HISTORY_YEARS)[number];

export function getPresidentialHistoryCycles(): HistoricalPresidentialCycle[] {
  return cycles;
}

export function getPresidentialCycleByYear(
  year: PresidentialHistoryYear,
): HistoricalPresidentialCycle | undefined {
  return cycles.find((cycle) => cycle.year === year);
}

export function getParliamentaryHistoryCycles(): ParliamentaryHistoryCycle[] {
  return parliamentaryHistory.cycles as ParliamentaryHistoryCycle[];
}

export function getParliamentaryHistoryMeta() {
  return {
    sourceName: parliamentaryHistory.sourceName,
    cycles: getParliamentaryHistoryCycles(),
  };
}

export function getDistrictResultForCycle(
  cycle: HistoricalPresidentialCycle,
  slug: string,
) {
  return cycle.districts.find((district) => district.slug === slug);
}

export function getWinnerShare(
  cycle: HistoricalPresidentialCycle,
  slug: string,
): number {
  const result = getDistrictResultForCycle(cycle, slug);
  if (!result) {
    return 0;
  }
  const winnerVotes = result.results[result.winner];
  if (!result.validVotes || winnerVotes == null) {
    return 0;
  }
  return (winnerVotes / result.validVotes) * 100;
}

export interface CycleSwing {
  fromYear: PresidentialHistoryYear;
  toYear: PresidentialHistoryYear;
  fromShare: number;
  toShare: number;
  swingPoints: number;
  flipped: boolean;
}

export function computeCycleSwing(
  slug: string,
  fromYear: PresidentialHistoryYear,
  toYear: PresidentialHistoryYear,
): CycleSwing | null {
  const fromCycle = getPresidentialCycleByYear(fromYear);
  const toCycle = getPresidentialCycleByYear(toYear);
  if (!fromCycle || !toCycle) {
    return null;
  }

  const fromResult = getDistrictResultForCycle(fromCycle, slug);
  const toResult = getDistrictResultForCycle(toCycle, slug);
  if (!fromResult || !toResult) {
    return null;
  }

  const fromShare = getWinnerShare(fromCycle, slug);
  const toShare = getWinnerShare(toCycle, slug);

  return {
    fromYear,
    toYear,
    fromShare,
    toShare,
    swingPoints: toShare - fromShare,
    flipped: fromResult.winner !== toResult.winner,
  };
}

export interface ProvinceCycleSwing {
  provinceSlug: string;
  avgSwing: number;
  districtsFlipped: number;
  districtCount: number;
}

export function computeProvinceCycleSwing(
  provinceSlug: string,
  fromYear: PresidentialHistoryYear,
  toYear: PresidentialHistoryYear,
): ProvinceCycleSwing | null {
  const province = PROVINCES.find((item) => item.slug === provinceSlug);
  if (!province) {
    return null;
  }

  const districts = getDistrictsForProvince(province);
  const swings = districts
    .map((district) => computeCycleSwing(district.slug, fromYear, toYear))
    .filter((swing): swing is CycleSwing => swing != null);

  if (swings.length === 0) {
    return null;
  }

  return {
    provinceSlug,
    avgSwing:
      swings.reduce((sum, swing) => sum + swing.swingPoints, 0) / swings.length,
    districtsFlipped: swings.filter((swing) => swing.flipped).length,
    districtCount: swings.length,
  };
}

export function getCandidateColorForCycle(
  cycle: HistoricalPresidentialCycle,
  candidateId: string,
): string {
  const palette: Record<string, string> = {
    mahinda: "#6366f1",
    fonseka: "#f59e0b",
    sirisena: "#14b8a6",
    gotabaya: "#6366f1",
    sajith: "#60a5fa",
    akd: "#14b8a6",
    premadasa: "#60a5fa",
    wickremesinghe: "#a78bfa",
    others: "#94a3b8",
  };
  return palette[candidateId] ?? "#94a3b8";
}
