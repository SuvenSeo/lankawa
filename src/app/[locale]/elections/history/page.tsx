import { getTranslations, setRequestLocale } from "next-intl/server";
import { ElectionHistoryExplorer } from "@/components/ElectionHistoryExplorer";
import { Link } from "@/i18n/navigation";

export default async function ElectionHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("electionHistory");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/elections"
          className="text-sm text-teal-300 hover:text-teal-200"
        >
          ← {t("back")}
        </Link>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <ElectionHistoryExplorer />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
