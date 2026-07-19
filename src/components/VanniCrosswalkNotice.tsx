import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { isVanniAdminDistrict } from "@/lib/election-swing";
import { getSourceProvenancePath } from "@/lib/sources";

export function VanniCrosswalkNotice({ districtSlug }: { districtSlug?: string }) {
  const t = useTranslations("vanni");

  const showDistrictNote =
    districtSlug != null && isVanniAdminDistrict(districtSlug);

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
      <h2 className="text-lg font-semibold text-amber-100">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-300">{t("body")}</p>

      <ul className="mt-4 space-y-2 text-sm text-slate-400">
        <li>
          <span className="font-medium text-slate-200">{t("adminLabel")}:</span>{" "}
          {t("adminDistricts")}
        </li>
        <li>
          <span className="font-medium text-slate-200">{t("electoralLabel")}:</span>{" "}
          {t("electoralDistrict")}
        </li>
      </ul>

      {showDistrictNote ? (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-100">
          {t("districtNote")}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-slate-500">
        {t("source")}:{" "}
        <Link
          href={getSourceProvenancePath("election_commission_2024")}
          className="text-teal-300 hover:text-teal-200"
        >
          {t("sourceLink")}
        </Link>
      </p>
    </section>
  );
}
