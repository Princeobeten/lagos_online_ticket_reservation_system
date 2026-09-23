/**
 * Seven days of takings. A single series, so there is no legend — the heading
 * names it. Only the best day is labelled, to avoid a number on every bar.
 */
export default function RevenueChart({ days, format }) {
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const best = days.reduce((a, b) => (b.revenue > a.revenue ? b : a), days[0]);

  return (
    <div>
      <div className="flex h-40 items-end gap-2">
        {days.map((day) => {
          const height = (day.revenue / max) * 100;
          return (
            <div
              key={day.key}
              // h-full matters: a percentage bar height needs a parent with a
              // definite height, otherwise every bar collapses to nothing.
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${day.label}: ${format(day.revenue)}`}
            >
              {day.revenue > 0 && day.key === best.key && (
                <span className="text-[11px] font-semibold tabular-nums text-brand-700">
                  {format(day.revenue)}
                </span>
              )}
              <div
                className="w-full rounded-t bg-brand-600 group-hover:bg-brand-700"
                style={{ height: `${Math.max(height, day.revenue ? 4 : 1.5)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 border-t border-line pt-2">
        {days.map((day) => (
          <span key={day.key} className="flex-1 text-center text-[11px] text-muted">
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}
