"use client";

import dynamic from "next/dynamic";

const ProvinceMapSection = dynamic(
  () =>
    import("@/components/ProvinceMapSection").then(
      (mod) => mod.ProvinceMapSection,
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

export { ProvinceMapSection };
