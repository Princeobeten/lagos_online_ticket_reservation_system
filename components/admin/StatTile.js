/** A headline number. No chart — the value is the whole message. */
export default function StatTile({ label, value, sub, tone = "plain" }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1.5 text-2xl font-bold tabular-nums ${
          tone === "brand" ? "text-brand-700" : "text-ink"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
