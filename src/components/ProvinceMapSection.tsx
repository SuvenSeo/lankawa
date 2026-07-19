"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChoroplethModeTabs,
  ProvinceChoroplethMap,
  type ChoroplethMode,
} from "@/components/ProvinceChoroplethMap";

export function ProvinceMapSection({
  provinceDistrictSlugs,
}: {
  provinceDistrictSlugs?: string[];
}) {
  const t = useTranslations("provinces");
  const [mode, setMode] = useState<ChoroplethMode>("density");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">{t("mapTitle")}</h2>
        <ChoroplethModeTabs mode={mode} onModeChange={setMode} />
      </div>
      <ProvinceChoroplethMap
        mode={mode}
        provinceDistrictSlugs={provinceDistrictSlugs}
      />
    </section>
  );
}
