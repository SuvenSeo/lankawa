"use client";

import dynamic from "next/dynamic";

export const PropertyChoroplethMap = dynamic(
  () =>
    import("@/components/PropertyChoroplethMap").then(
      (mod) => mod.PropertyChoroplethMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-slate-900/40 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);
