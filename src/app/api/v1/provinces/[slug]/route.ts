import { NextResponse } from "next/server";
import {
  getDistrictsForProvince,
  getProvince,
  getProvinceArea,
  getProvinceDensity,
  getProvincePopulation,
} from "@/lib/provinces";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const province = getProvince(slug);

  if (!province) {
    return NextResponse.json({ error: "Province not found" }, { status: 404 });
  }

  const districts = getDistrictsForProvince(province);

  return NextResponse.json({
    ...province,
    districtCount: districts.length,
    population: getProvincePopulation(districts),
    areaSqKm: getProvinceArea(districts),
    density: getProvinceDensity(districts),
    districts: districts.map((district) => ({
      slug: district.slug,
      name: district.name,
      nameSi: district.nameSi,
      nameTa: district.nameTa,
      population: district.population,
      areaSqKm: district.areaSqKm,
    })),
  });
}
