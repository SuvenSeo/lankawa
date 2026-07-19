import { NextResponse } from "next/server";
import { getParliamentaryElection2024 } from "@/lib/elections";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET() {
  const election = getParliamentaryElection2024();

  return NextResponse.json({
    election: {
      id: election.id,
      type: election.type,
      date: election.date,
      sourceId: election.sourceId,
      provenancePath: getSourceProvenancePath(election.sourceId),
      nationalWinner: election.nationalWinner,
      turnout: election.turnout,
      totalSeats: election.totalSeats,
    },
    parties: election.parties,
    districts: election.districts,
  });
}
