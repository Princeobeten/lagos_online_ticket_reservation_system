"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Cancels a booking and returns its seats to the pool. */
export default function CancelBookingButton({ reference }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    if (!confirm(`Cancel booking ${reference} and release its seats?`)) return;

    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/bookings/${reference}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button
        onClick={cancel}
        disabled={busy}
        className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        Cancel
      </button>
      {error && <p className="mt-1 max-w-56 text-xs text-red-700">{error}</p>}
    </>
  );
}
