import { NextResponse } from "next/server";
import { getPublicServiceById } from "@/lib/services";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const facility = getPublicServiceById(id);

  if (!facility) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  return NextResponse.json(facility);
}
