import type { FloodStationLevel } from "@/lib/types";

const ALERT_STYLES: Record<string, string> = {
  NORMAL: "border-teal-500/30 bg-teal-500/10 text-teal-100",
  ALERT: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  WARNING: "border-orange-500/30 bg-orange-500/10 text-orange-100",
  DANGER: "border-rose-500/30 bg-rose-500/10 text-rose-100",
  UNKNOWN: "border-slate-500/30 bg-slate-500/10 text-slate-200",
};

function alertClass(status: string): string {
  return ALERT_STYLES[status] ?? ALERT_STYLES.UNKNOWN;
}

export function FloodStationList({
  stations,
  title,
  emptyMessage,
}: {
  stations: FloodStationLevel[];
  title: string;
  emptyMessage: string;
}) {
  if (stations.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stations.map((station) => (
          <article
            key={station.stationName}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{station.stationName}</p>
                <p className="mt-0.5 text-xs text-slate-500">{station.riverName}</p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${alertClass(station.alertStatus)}`}
              >
                {station.alertStatus}
              </span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-slate-500">Level</dt>
                <dd className="font-medium text-slate-200">
                  {station.waterLevel.toFixed(2)} m
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Remarks</dt>
                <dd className="font-medium text-slate-200">{station.remarks}</dd>
              </div>
            </dl>
            {station.timestamp ? (
              <p className="mt-2 text-xs text-slate-500">{station.timestamp}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
