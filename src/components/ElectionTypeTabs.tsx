"use client";

import { Link } from "@/i18n/navigation";

export function ElectionTypeTabs({
  active,
  presidentialLabel,
  parliamentaryLabel,
}: {
  active: "presidential" | "parliamentary";
  presidentialLabel: string;
  parliamentaryLabel: string;
}) {
  const tabs = [
    { id: "presidential" as const, label: presidentialLabel, href: "/elections?type=presidential" },
    { id: "parliamentary" as const, label: parliamentaryLabel, href: "/elections?type=parliamentary" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            active === tab.id
              ? "bg-teal-500/20 text-teal-100"
              : "border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
