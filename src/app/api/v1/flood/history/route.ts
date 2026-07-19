import { NextResponse } from "next/server";
import { fetchFloodLevelHistory } from "@/lib/integrations/flood";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");
  const limit = Number(searchParams.get("limit") ?? "24");

  if (!station) {
    return NextResponse.json(
      { error: "station query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchFloodLevelHistory(station, limit);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { points: [], tier: "down" as const },
      { status: 200 },
    );
  }
}
