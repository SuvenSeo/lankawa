import { NextResponse } from "next/server";
import { PROVINCES } from "@/lib/provinces";

export async function GET() {
  return NextResponse.json({
    count: PROVINCES.length,
    provinces: PROVINCES,
  });
}
