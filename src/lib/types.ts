export type FreshnessTier = "fresh" | "stale" | "down" | "unknown";

export type SourceCategory =
  | "economy"
  | "disaster"
  | "energy"
  | "health"
  | "civic"
  | "transport";

export interface SourceDefinition {
  id: string;
  name: string;
  category: SourceCategory;
  /** Server-side fetch endpoint — never exposed as a clickable UI link. */
  url: string;
  cadenceMinutes: number;
  adapter: "api" | "scrape" | "partner";
  description: string;
  methodology: string;
  metrics: string[];
}

export interface SourceHealth {
  id: string;
  name: string;
  category: SourceCategory;
  tier: FreshnessTier;
  lastSuccessAt: string | null;
  lastCheckedAt: string;
  error: string | null;
  /** Internal provenance path, e.g. /sources/cbsl_fx */
  provenancePath: string;
}

export interface PulseMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  observedAt: string | null;
  tier: FreshnessTier;
  sourceId: string;
  /** Internal provenance path, e.g. /sources/cbsl_fx */
  provenancePath: string;
  note?: string;
}

export interface District {
  slug: string;
  name: string;
  nameSi: string;
  nameTa: string;
  province: string;
  capital: string;
  population: number;
  areaSqKm: number;
}

export interface FloodAlertSummary {
  alertLevel: string;
  count: number;
  stations: string[];
}

export interface PulseSnapshot {
  generatedAt: string;
  metrics: PulseMetric[];
  flood: FloodAlertSummary[];
  sources: SourceHealth[];
}

export type ElectionCandidateId =
  | "akd"
  | "premadasa"
  | "wickremesinghe"
  | "others";

export interface ElectionCandidate {
  id: ElectionCandidateId;
  name: string;
  party: string;
  votes: number;
  percentage: number;
  finalPercentage?: number;
}

export interface ElectionDistrictResult {
  slug: string;
  winner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  results: Record<ElectionCandidateId, number>;
  electoralDistrict?: string;
  note?: string;
}

export interface PresidentialElection {
  id: string;
  type: "presidential";
  date: string;
  sourceId: string;
  sourceName: string;
  nationalWinner: ElectionCandidateId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  candidates: ElectionCandidate[];
  districts: ElectionDistrictResult[];
}

export type ParliamentaryPartyId =
  | "npp"
  | "sjb"
  | "itak"
  | "ndf"
  | "slpp"
  | "others";

export interface ParliamentaryParty {
  id: ParliamentaryPartyId;
  name: string;
  abbreviation: string;
  districtSeats: number;
  nationalListSeats: number;
  totalSeats: number;
  votes: number;
  percentage: number;
}

export interface ParliamentaryDistrictResult {
  slug: string;
  name: string;
  province: string;
  districtSlugs: string[];
  totalSeats: number;
  turnout: number;
  winner: ParliamentaryPartyId;
  seats: Record<ParliamentaryPartyId, number>;
  votes: Record<ParliamentaryPartyId, number>;
}

export interface ParliamentaryElection {
  id: string;
  type: "parliamentary";
  date: string;
  sourceId: string;
  sourceName: string;
  totalSeats: number;
  districtSeats: number;
  nationalListSeats: number;
  nationalWinner: ParliamentaryPartyId;
  turnout: number;
  validVotes: number;
  registeredElectors: number;
  parties: ParliamentaryParty[];
  districts: ParliamentaryDistrictResult[];
}

export interface FloodStationLevel {
  stationName: string;
  riverName: string;
  waterLevel: number;
  alertStatus: string;
  remarks: string;
  timestamp: string;
}

export type PublicServiceType = "hospital" | "school" | "gn_office";

export interface PublicServiceFacility {
  id: string;
  type: PublicServiceType;
  name: string;
  nameSi?: string;
  nameTa?: string;
  districtSlug: string;
  address: string;
}

export interface EconomyMacroIndicator {
  id: string;
  label: string;
  value: number;
  unit: string;
  period: string;
}

export interface FxSeriesPoint {
  date: string;
  sellRate: number;
}

export interface EconomyMacroSnapshot {
  sourceId: string;
  sourceName: string;
  asOf: string;
  indicators: EconomyMacroIndicator[];
  fxSeries: FxSeriesPoint[];
}
