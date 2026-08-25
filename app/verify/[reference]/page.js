import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { signReference } from "@/lib/ticket";
import CheckInPanel from "@/components/CheckInPanel";
import { clockTime, longDate, MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Opened by scanning a ticket QR code. It shows the gate officer who the
 * passenger is and whether the ticket may still be used.
 */
export default async function VerifyTicketPage({ params, searchParams }) {
  const { reference } = await params;
  const { t } = await searchParams;

  await connectDB();
  const booking = await Booking.findOne({ reference }).populate("trip");

  if (!booking) {
    return (
      <Result tone="bad" title="Unknown ticket">
        No booking exists with reference{" "}
        <span className="font-mono">{reference}</span>.
      </Result>
    );
  }

  if (booking.status !== "paid") {
    return (
      <Result tone="bad" title="Not valid for boarding">
        This booking is <strong>{booking.status}</strong>, not paid.
      </Result>
    );
  }

  // A reference typed in by hand has no signature; supply the correct one so
  // the officer can still admit the passenger after visually confirming them.
  const signature = t || signReference(reference);
  const { trip } = booking;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="card overflow-hidden">
        <div className="bg-brand-900 px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-brand-100">
            Boarding check
          </p>
          <h1 className="mt-1 text-xl font-bold">{booking.passengerName}</h1>
          <p className="font-mono text-sm text-brand-100">{booking.reference}</p>
        </div>

        <dl className="grid grid-cols-2 gap-4 p-6 text-sm">
          <Field label="Route" value={`${trip.origin} → ${trip.destination}`} />
          <Field label="Vehicle" value={`${trip.vehicleLabel} (${MODE_LABEL[trip.mode]})`} />
          <Field label="Date" value={longDate(trip.departureAt)} />
          <Field label="Departs" value={clockTime(trip.departureAt)} />
          <Field label="Seats" value={booking.seats.join(", ")} />
          <Field label="Phone" value={booking.passengerPhone} />
        </dl>
      </div>

      <CheckInPanel
        reference={booking.reference}
        signature={signature}
        alreadyBoardedAt={
          booking.ticket?.checkedInAt
            ? booking.ticket.checkedInAt.toISOString()
            : null
        }
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function Result({ tone, title, children }) {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <div
        className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-2xl ${
          tone === "bad" ? "bg-red-50" : "bg-brand-50"
        }`}
      >
        {tone === "bad" ? "✕" : "✓"}
      </div>
      <h1 className="mt-4 text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">{children}</p>
    </div>
  );
}
