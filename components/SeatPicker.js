"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { naira } from "@/lib/format";

const MAX_SEATS = 5;

export default function SeatPicker({ trip, signedIn, passenger }) {
  const router = useRouter();
  const [seatMap, setSeatMap] = useState(trip.seatMap);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState(passenger?.fullName || "");
  const [phone, setPhone] = useState(passenger?.phone || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Somebody else may take a seat while this page is open, so the map is
  // refreshed periodically and always re-checked on the server at booking time.
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const fresh = await res.json();
        setSeatMap(fresh.seatMap);
        setSelected((current) =>
          current.filter((seat) =>
            fresh.seatMap.flat().some((s) => s.number === seat && s.status === "available")
          )
        );
      } catch {
        /* a failed refresh is harmless -- the server checks again on submit */
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [trip.id]);

  function toggleSeat(seat) {
    setError("");
    setSelected((current) => {
      if (current.includes(seat.number)) {
        return current.filter((s) => s !== seat.number);
      }
      if (current.length >= MAX_SEATS) {
        setError(`You can book at most ${MAX_SEATS} seats in one booking.`);
        return current;
      }
      return [...current, seat.number];
    });
  }

  async function reserveAndPay() {
    setError("");
    setBusy(true);

    try {
      // Step 1 -- hold the seats.
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip.id,
          seats: selected,
          passengerName: name,
          passengerPhone: phone,
        }),
      });
      const booking = await bookingRes.json();

      if (!bookingRes.ok) {
        setError(booking.error);
        setBusy(false);
        if (bookingRes.status === 409) router.refresh(); // seat map is stale
        return;
      }

      // Step 2 -- send the passenger to the payment gateway.
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: booking.booking.reference }),
      });
      const payment = await payRes.json();

      if (!payRes.ok) {
        setError(payment.error);
        setBusy(false);
        return;
      }

      window.location.href = payment.authorizationUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const total = trip.fare * selected.length;
  const aisleAfter = Math.floor(trip.columns / 2);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Seat map */}
      <div className="card p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
          <Legend className="border-line bg-surface" label="Available" />
          <Legend className="border-brand-600 bg-brand-600" label="Selected" />
          <Legend className="border-line bg-canvas" label="Taken" />
        </div>

        <div className="mx-auto w-fit">
          <div className="mb-4 flex items-center justify-between rounded-lg border border-dashed border-line px-4 py-2 text-xs text-muted">
            <span>Front / boarding door</span>
            <span>{trip.mode === "ferry" ? "Bow" : "Driver"}</span>
          </div>

          <div className="space-y-2">
            {seatMap.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2">
                <span className="w-4 text-xs font-medium text-muted">
                  {String.fromCharCode(65 + rowIndex)}
                </span>
                {row.map((seat, columnIndex) => (
                  <span key={seat.number} className="flex items-center gap-2">
                    <Seat
                      seat={seat}
                      selected={selected.includes(seat.number)}
                      onClick={() => toggleSeat(seat)}
                    />
                    {columnIndex + 1 === aisleAfter && (
                      <span className="w-5" aria-hidden="true" />
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking summary */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="card p-5">
          <h2 className="font-semibold">Your selection</h2>

          <div className="mt-3 flex min-h-9 flex-wrap gap-1.5">
            {selected.length === 0 ? (
              <p className="text-sm text-muted">No seat selected yet.</p>
            ) : (
              selected.map((seat) => (
                <span
                  key={seat}
                  className="rounded-md bg-brand-50 px-2 py-1 text-sm font-semibold text-brand-700"
                >
                  {seat}
                </span>
              ))
            )}
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <Row label="Fare per seat" value={naira(trip.fare)} />
            <Row label="Seats" value={selected.length} />
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{naira(total)}</dd>
            </div>
          </dl>
        </div>

        {signedIn ? (
          <div className="card space-y-4 p-5">
            <div>
              <label className="label" htmlFor="name">Passenger name</label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input
                id="phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {error && <p className="alert-error">{error}</p>}

            <button
              className="btn-primary w-full"
              disabled={selected.length === 0 || busy || !name || !phone}
              onClick={reserveAndPay}
            >
              {busy ? "Holding your seats…" : `Reserve and pay ${naira(total)}`}
            </button>

            <p className="text-center text-xs text-muted">
              Seats are held for 10 minutes while you pay.
            </p>
          </div>
        ) : (
          <div className="card p-5 text-sm">
            <p className="font-medium">Sign in to complete your booking.</p>
            <p className="mt-1 text-muted">
              Your ticket is tied to your account so you can retrieve it anytime.
            </p>
            <Link
              href={`/login?next=/trips/${trip.id}`}
              className="btn-primary mt-4 w-full"
            >
              Sign in to continue
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

function Seat({ seat, selected, onClick }) {
  const taken = seat.status !== "available";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={taken}
      aria-pressed={selected}
      aria-label={`Seat ${seat.number}${taken ? " (taken)" : ""}`}
      className={`h-10 w-10 rounded-lg border text-xs font-semibold transition ${
        taken
          ? "cursor-not-allowed border-line bg-canvas text-muted/50 line-through"
          : selected
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-line bg-surface text-ink hover:border-brand-600 hover:bg-brand-50"
      }`}
    >
      {seat.number}
    </button>
  );
}

function Legend({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-4 w-4 rounded border ${className}`} />
      <span className="text-muted">{label}</span>
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
