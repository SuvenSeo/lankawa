import baselineData from "@/data/elections-presidential-2020-baseline.json";
import { getElectionDistrictResult, getPresidentialElection2024 } from "./elections";
import type { ElectionDistrictResult } from "./types";

export type BaselineCandidateId = "gotabaya" | "sajith" | "others";

export interface BaselineCandidate {
  id: BaselineCandidateId;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  finalPercentage?: number;
}

export interface BaselineDistrictResult {
  slug: string;
  winner: BaselineCandidateId;
  turnout: number;
  validVotes: number;
  results: Record<BaselineCandidateId, number>;
  electoralDistrict?: string;
  note?: string;
}

export interface PresidentialBaselineElection {
  id: string;
  type: "presidential";
  date: string;
  label: string;
  sourceId: string;
  sourceName: string;
  nationalWinner: BaselineCandidateId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  candidates: BaselineCandidate[];
  districts: BaselineDistrictResult[];
}

const baseline = baselineData as PresidentialBaselineElection;

export function getPresidentialBaseline2020(): PresidentialBaselineElection {
  return baseline;
}

export function getBaselineDistrictResult(
  slug: string,
): BaselineDistrictResult | undefined {
  return baseline.districts.find((district) => district.slug === slug);
}

export function getBaselineCandidateShare(
  result: BaselineDistrictResult,
  candidateId: BaselineCandidateId,
): number {
  const votes = result.results[candidateId];
  if (!result.validVotes || votes == null) {
    return 0;
  }
  return (votes / result.validVotes) * 100;
}

export function getBaselineCandidateColor(
  candidateId: BaselineCandidateId,
): string {
  switch (candidateId) {
    case "gotabaya":
      return "#6366f1";
    case "sajith":
      return "#60a5fa";
    case "others":
      return "#94a3b8";
    default: {
      const _exhaustive: never = candidateId;
      return _exhaustive;
    }
  }
}

export interface DistrictSwing {
  slug: string;
  baselineWinner: BaselineCandidateId;
  currentWinner: ElectionDistrictResult["winner"];
  baselineLeadingShare: number;
  currentLeadingShare: number;
  swingPoints: number;
  flipped: boolean;
  /** NPP (AKD) 2024 share minus SLPP (Gotabaya) 2019 share */
  nppSwingFromSlpp: number;
}

function mapCurrentToBaselineWinner(
  currentWinner: ElectionDistrictResult["winner"],
): BaselineCandidateId {
  switch (currentWinner) {
    case "akd":
      return "gotabaya";
    case "premadasa":
      return "sajith";
    case "wickremesinghe":
    case "others":
      return "others";
    default: {
      const _exhaustive: never = currentWinner;
      return _exhaustive;
    }
  }
}

export function computeDistrictSwing(slug: string): DistrictSwing | null {
  const baselineResult = getBaselineDistrictResult(slug);
  const currentResult = getElectionDistrictResult(slug);

  if (!baselineResult || !currentResult) {
    return null;
  }

  const baselineLeadingShare = getBaselineCandidateShare(
    baselineResult,
    baselineResult.winner,
  );
  const currentLeadingShare =
    (currentResult.results[currentResult.winner] / currentResult.validVotes) *
    100;

  const baselineSlpp = getBaselineCandidateShare(baselineResult, "gotabaya");
  const currentNpp =
    (currentResult.results.akd / currentResult.validVotes) * 100;

  return {
    slug,
    baselineWinner: baselineResult.winner,
    currentWinner: currentResult.winner,
    baselineLeadingShare,
    currentLeadingShare,
    swingPoints: currentLeadingShare - baselineLeadingShare,
    flipped:
      baselineResult.winner !== mapCurrentToBaselineWinner(currentResult.winner),
    nppSwingFromSlpp: currentNpp - baselineSlpp,
  };
}

export function getAllDistrictSwings(): DistrictSwing[] {
  const election = getPresidentialElection2024();
  return election.districts
    .map((district) => computeDistrictSwing(district.slug))
    .filter((swing): swing is DistrictSwing => swing != null);
}

export const VANNI_ADMIN_DISTRICTS = [
  "kilinochchi",
  "mannar",
  "mullaitivu",
  "vavuniya",
] as const;

export type VanniAdminDistrict = (typeof VANNI_ADMIN_DISTRICTS)[number];

export function isVanniAdminDistrict(slug: string): slug is VanniAdminDistrict {
  return (VANNI_ADMIN_DISTRICTS as readonly string[]).includes(slug);
}
