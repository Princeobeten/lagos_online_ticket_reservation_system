"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { naira } from "@/lib/format";

/** Turns a Date into the value format <input type="datetime-local"> expects. */
function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

export default function TripForm({ trip }) {
  const router = useRouter();
  const editing = Boolean(trip);
  const [form, setForm] = useState({
    operator: trip?.operator || "",
    mode: trip?.mode || "bus",
    routeCode: trip?.routeCode || "",
    origin: trip?.origin || "",
    destination: trip?.destination || "",
    vehicleLabel: trip?.vehicleLabel || "",
    fare: trip?.fare || "",
    rows: trip?.rows || 8,
    columns: trip?.columns || 4,
    departureAt: toLocalInput(trip?.departureAt),
    arrivalAt: toLocalInput(trip?.arrivalAt),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const capacity = (Number(form.rows) || 0) * (Number(form.columns) || 0);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch(
      editing ? `/api/admin/trips/${trip.id}` : "/api/admin/trips",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }

    router.push("/admin/trips");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Service</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="operator">Operator</label>
            <input id="operator" className="input" required placeholder="BRT"
              value={form.operator} onChange={set("operator")} />
          </div>
          <div>
            <label className="label" htmlFor="mode">Mode</label>
            <select id="mode" className="input" value={form.mode} onChange={set("mode")}>
              <option value="bus">Bus</option>
              <option value="ferry">Ferry</option>
              <option value="rail">Rail</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="routeCode">Route code</label>
            <input id="routeCode" className="input" required placeholder="BRT-01"
              value={form.routeCode} onChange={set("routeCode")} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Route and schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="origin">From</label>
            <input id="origin" className="input" required placeholder="Ikorodu"
              value={form.origin} onChange={set("origin")} />
          </div>
          <div>
            <label className="label" htmlFor="destination">To</label>
            <input id="destination" className="input" required placeholder="TBS"
              value={form.destination} onChange={set("destination")} />
          </div>
          <div>
            <label className="label" htmlFor="departureAt">Departs</label>
            <input id="departureAt" type="datetime-local" className="input" required
              value={form.departureAt} onChange={set("departureAt")} />
          </div>
          <div>
            <label className="label" htmlFor="arrivalAt">Arrives</label>
            <input id="arrivalAt" type="datetime-local" className="input" required
              value={form.arrivalAt} onChange={set("arrivalAt")} />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Vehicle and fare</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label" htmlFor="vehicleLabel">Vehicle</label>
            <input id="vehicleLabel" className="input" required placeholder="BRT-014"
              value={form.vehicleLabel} onChange={set("vehicleLabel")} />
          </div>
          <div>
            <label className="label" htmlFor="fare">Fare (₦)</label>
            <input id="fare" type="number" min="1" className="input" required
              value={form.fare} onChange={set("fare")} />
          </div>
          <div>
            <label className="label" htmlFor="rows">Seat rows</label>
            <input id="rows" type="number" min="1" max="26" className="input" required
              value={form.rows} onChange={set("rows")} />
          </div>
          <div>
            <label className="label" htmlFor="columns">Seats per row</label>
            <input id="columns" type="number" min="1" max="10" className="input" required
              value={form.columns} onChange={set("columns")} />
          </div>
        </div>
        <p className="text-sm text-muted">
          Capacity: <strong className="text-ink">{capacity} seats</strong>
          {form.fare ? (
            <> · full vehicle earns <strong className="text-ink">{naira(capacity * Number(form.fare))}</strong></>
          ) : null}
        </p>
      </div>

      {error && <p className="alert-error">{error}</p>}

      <div className="flex gap-2">
        <button className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Create trip"}
        </button>
        <Link href="/admin/trips" className="btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
