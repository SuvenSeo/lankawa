import { Link } from "@/i18n/navigation";
import {
  getDistrictsForProvince,
  getProvinceArea,
  getProvinceDensity,
  getProvinceName,
  getProvincePopulation,
  type Province,
} from "@/lib/provinces";

export function ProvinceCard({
  province,
  locale,
}: {
  province: Province;
  locale: string;
}) {
  const districts = getDistrictsForProvince(province);
  const population = getProvincePopulation(districts);
  const area = getProvinceArea(districts);

  return (
    <Link
      href={`/provinces/${province.slug}`}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-teal-400/30 hover:bg-white/10"
    >
      <h3 className="text-lg font-semibold text-white">
        {getProvinceName(province, locale)}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {districts.length} districts
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Population</dt>
          <dd className="font-medium text-slate-200">
            {population.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Area</dt>
          <dd className="font-medium text-slate-200">
            {area.toLocaleString()} km²
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        {getProvinceDensity(districts).toLocaleString()} /km² avg density
      </p>
    </Link>
  );
}
