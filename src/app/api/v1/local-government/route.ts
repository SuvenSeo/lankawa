import { NextResponse } from "next/server";
import {
  filterLocalGovernment,
  getLocalGovernmentCatalog,
} from "@/lib/local-government";
import type { LocalGovernmentType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district") ?? undefined;
  const type = searchParams.get("type") as LocalGovernmentType | null;
  const q = searchParams.get("q") ?? undefined;

  const catalog = getLocalGovernmentCatalog();
  const bodies = filterLocalGovernment({
    district,
    type: type ?? undefined,
    query: q,
  });

  return NextResponse.json({
    sourceId: catalog.sourceId,
    totalCount: catalog.totalCount,
    count: bodies.length,
    bodies,
    provenancePath: `/sources/${catalog.sourceId}`,
  });
}
