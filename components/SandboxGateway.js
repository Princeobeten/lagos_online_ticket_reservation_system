"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { naira } from "@/lib/format";

/**
 * Stand-in for the Paystack checkout page, used when no API key is configured.
 * It hits exactly the same verification endpoint the real gateway redirects to.
 */
export default function SandboxGateway({ booking }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");

  function finish(outcome) {
    setBusy(outcome);
    router.push(
      `/payment/callback?reference=${booking.reference}&simulate=${outcome}`
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-brand-900 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-wide text-brand-100">
            Sandbox payment gateway
          </p>
          <p className="mt-1 text-2xl font-bold">{naira(booking.amount)}</p>
          <p className="text-xs text-brand-100">{booking.passengerEmail}</p>
        </div>

        <div className="space-y-3 p-5 text-sm">
          <Row label="Booking reference" value={booking.reference} mono />
          <Row label="Trip" value={booking.route} />
          <Row label="Seats" value={booking.seats.join(", ")} />
        </div>

        <div className="space-y-2 border-t border-line p-5">
          <button
            className="btn-primary w-full"
            disabled={Boolean(busy)}
            onClick={() => finish("success")}
          >
            {busy === "success" ? "Processing…" : "Pay now (simulate success)"}
          </button>
          <button
            className="btn-ghost w-full"
            disabled={Boolean(busy)}
            onClick={() => finish("failed")}
          >
            Simulate a failed payment
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        No Paystack key is configured, so this test screen stands in for the real
        checkout. Add PAYSTACK_SECRET_KEY to .env.local to use live test cards.
      </p>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
