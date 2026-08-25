"use client";

import { useState } from "react";

/**
 * Sends the passenger back to the gateway for a booking that was never paid.
 * Going through /api/payments/initialize means this works with the real
 * Paystack checkout as well as the sandbox screen.
 */
export default function ResumePaymentButton({ reference }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function resume() {
    setBusy(true);
    setError("");

    const res = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  return (
    <div className="text-right">
      <button className="btn-primary" disabled={busy} onClick={resume}>
        {busy ? "Opening…" : "Complete payment"}
      </button>
      {error && <p className="mt-1 max-w-48 text-xs text-red-700">{error}</p>}
    </div>
  );
}
