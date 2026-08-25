"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * The gateway sends the passenger back here. Nothing is trusted from the URL --
 * the server is asked to confirm the transaction with Paystack before the
 * ticket is issued.
 */
export default function PaymentCallback({ reference, simulate }) {
  const router = useRouter();
  const [state, setState] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, simulate }),
      });
      const data = await res.json();
      if (cancelled) return;

      if (res.ok) {
        router.replace(`/tickets/${data.reference}`);
      } else {
        setError(data.error);
        setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reference, simulate, router]);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      {state === "verifying" ? (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-line border-t-brand-600" />
          <h1 className="mt-5 text-xl font-bold">Confirming your payment…</h1>
          <p className="mt-1 text-sm text-muted">
            Please do not close this page. Reference {reference}.
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </div>
          <h1 className="mt-5 text-xl font-bold">Payment not confirmed</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <p className="mt-1 text-sm text-muted">
            Your seats are still held for a few more minutes.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/tickets" className="btn-ghost">
              View my bookings
            </Link>
            <Link href="/trips" className="btn-primary">
              Search again
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
