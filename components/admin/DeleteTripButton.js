"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTripButton({ id, label }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!confirm(`Delete the ${label} departure? This cannot be undone.`)) return;

    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/trips/${id}`, { method: "DELETE" });
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
        onClick={remove}
        disabled={busy}
        className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
      {error && <p className="mt-1 max-w-56 text-xs text-red-700">{error}</p>}
    </>
  );
}
