import { NextResponse } from "next/server";
import {
  filterPublicServices,
  getPublicServicesCatalog,
} from "@/lib/services";
import type { PublicServiceType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district") ?? undefined;
  const type = searchParams.get("type") as PublicServiceType | "all" | null;
  const q = searchParams.get("q") ?? undefined;

  const catalog = getPublicServicesCatalog();
  const facilities = filterPublicServices({
    district,
    type: type && type !== "all" ? type : undefined,
    query: q,
  });

  return NextResponse.json({
    sourceId: catalog.sourceId,
    count: facilities.length,
    facilities,
  });
}
