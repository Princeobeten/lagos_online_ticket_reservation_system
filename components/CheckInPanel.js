"use client";

import { useState } from "react";
import { longDate, clockTime } from "@/lib/format";

/** Stamps the ticket as used. A ticket can only be admitted once. */
export default function CheckInPanel({ reference, signature, alreadyBoardedAt }) {
  const [boardedAt, setBoardedAt] = useState(alreadyBoardedAt);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkIn() {
    setBusy(true);
    setError("");

    const res = await fetch(`/api/tickets/${reference}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature, gate: "Gate 1" }),
    });
    const data = await res.json();

    if (res.ok) {
      setBoardedAt(data.checkedInAt);
    } else {
      setError(data.error);
      if (data.checkedInAt) setBoardedAt(data.checkedInAt);
    }
    setBusy(false);
  }

  if (boardedAt) {
    return (
      <div className="card border-brand-500 bg-brand-50 p-5 text-center">
        <p className="text-3xl">✓</p>
        <p className="mt-2 font-bold text-brand-700">Passenger boarded</p>
        <p className="mt-1 text-sm text-brand-700/80">
          Checked in {longDate(boardedAt)} at {clockTime(boardedAt)}
        </p>
        {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="alert-error">{error}</p>}
      <button className="btn-primary w-full py-4 text-base" disabled={busy} onClick={checkIn}>
        {busy ? "Checking…" : "Admit passenger"}
      </button>
    </div>
  );
}
