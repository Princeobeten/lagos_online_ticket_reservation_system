/**
 * Horizontal magnitude bars. One hue throughout — the row label carries the
 * identity, so colouring each row differently would be redundant. Every bar is
 * directly labelled with its value, so the chart is readable without colour.
 */
export default function BarRows({ rows, format, empty = "No data yet." }) {
  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  }

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} title={`${row.label}: ${format(row.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{row.label}</span>
            <span className="tabular-nums text-muted">{format(row.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-canvas">
            <div
              className="h-2 rounded-full bg-brand-600 transition-[width]"
              style={{ width: `${Math.max((row.value / max) * 100, row.value ? 3 : 0)}%` }}
            />
          </div>
          {row.note && <p className="mt-0.5 text-xs text-muted">{row.note}</p>}
        </li>
      ))}
    </ul>
  );
}
