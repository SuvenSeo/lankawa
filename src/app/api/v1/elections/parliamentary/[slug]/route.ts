import { NextResponse } from "next/server";
import { getParliamentaryDistrictResult } from "@/lib/elections";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const result = getParliamentaryDistrictResult(slug);

  if (!result) {
    return NextResponse.json(
      { error: "Electoral district not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
