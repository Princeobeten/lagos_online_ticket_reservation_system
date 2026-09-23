import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { getCurrentUser } from "@/lib/auth";
import { ticketQrDataUrl } from "@/lib/ticket";
import { naira, clockTime, longDate, MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TicketPage({ params }) {
  const { reference } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/tickets/${reference}`);

  await connectDB();
  const booking = await Booking.findOne({
    reference,
    user: user._id,
  }).populate("trip");
  if (!booking) notFound();
  if (booking.status !== "paid") redirect(`/payment/sandbox/${reference}`);

  const qr = await ticketQrDataUrl(booking.reference);
  const { trip } = booking;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href="/tickets" className="text-sm text-muted hover:text-ink">
        ← All tickets
      </Link>

      <div className="card overflow-hidden">
        <div className="bg-brand-900 px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-brand-100">
            Lagos State Transport Company
          </p>
          <h1 className="mt-1 text-xl font-bold">
            {trip.origin} → {trip.destination}
          </h1>
          <p className="text-sm text-brand-100">
            {trip.operator} · {MODE_LABEL[trip.mode]} · {trip.vehicleLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 text-sm">
          <Field label="Passenger" value={booking.passengerName} />
          <Field label="Phone" value={booking.passengerPhone} />
          <Field label="Date" value={longDate(trip.departureAt)} />
          <Field label="Departs" value={clockTime(trip.departureAt)} />
          <Field
            label={booking.seats.length > 1 ? "Seats" : "Seat"}
            value={booking.seats.join(", ")}
          />
          <Field label="Fare paid" value={naira(booking.amount)} />
        </div>

        {/* Perforated edge, purely decorative */}
        <div className="relative border-t border-dashed border-line">
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-canvas" />
          <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-canvas" />
        </div>

        <div className="p-6 text-center">
          <Image
            src={qr}
            alt={`QR code for ticket ${booking.reference}`}
            width={200}
            height={200}
            unoptimized
            className="mx-auto rounded-lg border border-line"
          />
          <p className="mt-3 font-mono text-lg font-bold tracking-wider">
            {booking.reference}
          </p>
          <p className="mt-1 text-xs text-muted">
            Show this code at the boarding gate.
          </p>

          {booking.ticket?.checkedInAt && (
            <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-xs text-muted">
              Boarded on {longDate(booking.ticket.checkedInAt)} at{" "}
              {clockTime(booking.ticket.checkedInAt)} ·{" "}
              {booking.ticket.checkedInGate}
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Paid via {booking.payment?.channel || booking.payment?.provider} on{" "}
        {longDate(booking.payment?.paidAt || booking.createdAt)}.
      </p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
