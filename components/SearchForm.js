"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayISO } from "@/lib/format";

/** Objective 1: the entry point for searching routes and schedules. */
export default function SearchForm({ initial = {} }) {
  const router = useRouter();
  const [form, setForm] = useState({
    origin: initial.origin || "",
    destination: initial.destination || "",
    date: initial.date || todayISO(),
    mode: initial.mode || "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const query = new URLSearchParams(
      Object.entries(form).filter(([, value]) => value)
    );
    router.push(`/trips?${query.toString()}`);
  }

  return (
    <form onSubmit={submit} className="card p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="origin">From</label>
          <input
            id="origin"
            className="input"
            list="terminals"
            placeholder="Ikorodu"
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="destination">To</label>
          <input
            id="destination"
            className="input"
            list="terminals"
            placeholder="CMS"
            value={form.destination}
            onChange={(e) => update("destination", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="date">Travel date</label>
          <input
            id="date"
            type="date"
            className="input"
            value={form.date}
            min={todayISO()}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="mode">Mode</label>
          <select
            id="mode"
            className="input"
            value={form.mode}
            onChange={(e) => update("mode", e.target.value)}
          >
            <option value="">All modes</option>
            <option value="bus">Bus</option>
            <option value="ferry">Ferry</option>
            <option value="rail">Rail</option>
          </select>
        </div>
      </div>

      <datalist id="terminals">
        <option value="Ikorodu" />
        <option value="CMS" />
        <option value="Oshodi" />
        <option value="Ikeja" />
        <option value="Berger" />
        <option value="Marina" />
        <option value="Badore" />
        <option value="Victoria Island" />
        <option value="Agbado" />
        <option value="Mile 2" />
      </datalist>

      <button type="submit" className="btn-primary mt-4 w-full sm:w-auto">
        Search trips
      </button>
    </form>
  );
}
