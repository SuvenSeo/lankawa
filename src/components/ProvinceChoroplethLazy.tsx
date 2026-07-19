"use client";

import dynamic from "next/dynamic";
import type { ChoroplethMode } from "@/components/ProvinceChoroplethMap";

const ProvinceChoroplethMap = dynamic(
  () =>
    import("@/components/ProvinceChoroplethMap").then(
      (mod) => mod.ProvinceChoroplethMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export { ProvinceChoroplethMap };
export type { ChoroplethMode };
