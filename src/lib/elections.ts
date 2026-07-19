import electionData from "@/data/elections-presidential-2024.json";
import parliamentaryData from "@/data/elections-parliamentary-2024.json";
import type {
  ElectionCandidate,
  ElectionCandidateId,
  ElectionDistrictResult,
  ParliamentaryDistrictResult,
  ParliamentaryElection,
  ParliamentaryParty,
  ParliamentaryPartyId,
  PresidentialElection,
} from "./types";

const election = electionData as PresidentialElection;
const parliamentary = parliamentaryData as ParliamentaryElection;

export function getPresidentialElection2024(): PresidentialElection {
  return election;
}

export function getElectionDistrictResult(
  slug: string,
): ElectionDistrictResult | undefined {
  return election.districts.find((district) => district.slug === slug);
}

export function getElectionCandidate(
  id: string,
): ElectionCandidate | undefined {
  return election.candidates.find((candidate) => candidate.id === id);
}

export function getDistrictWinnerPercentage(
  result: ElectionDistrictResult,
): number {
  const winnerVotes = result.results[result.winner];
  if (!result.validVotes || winnerVotes == null) {
    return 0;
  }
  return (winnerVotes / result.validVotes) * 100;
}

export function countDistrictsWonBy(candidateId: ElectionCandidateId): number {
  return election.districts.filter(
    (district) => district.winner === candidateId,
  ).length;
}

export function getCandidateColor(
  candidateId: ElectionCandidate["id"],
): string {
  switch (candidateId) {
    case "akd":
      return "#14b8a6";
    case "premadasa":
      return "#60a5fa";
    case "wickremesinghe":
      return "#a78bfa";
    case "others":
      return "#94a3b8";
    default: {
      const _exhaustive: never = candidateId;
      return _exhaustive;
    }
  }
}

export function getParliamentaryElection2024(): ParliamentaryElection {
  return parliamentary;
}

export function getParliamentaryParty(
  id: string,
): ParliamentaryParty | undefined {
  return parliamentary.parties.find((party) => party.id === id);
}

export function getParliamentaryDistrictResult(
  slug: string,
): ParliamentaryDistrictResult | undefined {
  return parliamentary.districts.find((district) => district.slug === slug);
}

export function getParliamentaryDistrictForAdminDistrict(
  adminDistrictSlug: string,
): ParliamentaryDistrictResult | undefined {
  return parliamentary.districts.find((district) =>
    district.districtSlugs.includes(adminDistrictSlug),
  );
}

export function countElectoralDistrictsWonBy(
  partyId: ParliamentaryPartyId,
): number {
  return parliamentary.districts.filter(
    (district) => district.winner === partyId,
  ).length;
}

export function getPartyColor(partyId: ParliamentaryPartyId): string {
  switch (partyId) {
    case "npp":
      return "#14b8a6";
    case "sjb":
      return "#60a5fa";
    case "itak":
      return "#f59e0b";
    case "ndf":
      return "#a78bfa";
    case "slpp":
      return "#6366f1";
    case "others":
      return "#94a3b8";
    default: {
      const _exhaustive: never = partyId;
      return _exhaustive;
    }
  }
}

export function getPartySeatShare(
  result: ParliamentaryDistrictResult,
  partyId: ParliamentaryPartyId,
): number {
  if (!result.totalSeats) {
    return 0;
  }
  return (result.seats[partyId] / result.totalSeats) * 100;
}
