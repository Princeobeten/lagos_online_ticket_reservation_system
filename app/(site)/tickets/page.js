import Link from "next/link";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { getCurrentUser } from "@/lib/auth";
import ResumePaymentButton from "@/components/ResumePaymentButton";
import { naira, clockTime, longDate, MODE_ICON } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  paid: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  expired: "bg-canvas text-muted",
};

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/tickets");

  await connectDB();
  const bookings = await Booking.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("trip");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My tickets</h1>
        <p className="text-sm text-muted">
          Every booking on your account, newest first.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium">You have not booked a trip yet.</p>
          <Link href="/trips" className="btn-primary mt-4">
            Find a trip
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li key={booking.reference} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold capitalize ${
                        STATUS_STYLE[booking.status]
                      }`}
                    >
                      {booking.status}
                    </span>
                    {booking.ticket?.checkedInAt && (
                      <span className="rounded-full bg-canvas px-2 py-0.5 text-muted">
                        Boarded
                      </span>
                    )}
                    <span className="font-mono text-muted">
                      {booking.reference}
                    </span>
                  </div>

                  <h2 className="mt-1 truncate font-semibold">
                    {MODE_ICON[booking.trip.mode]} {booking.trip.origin} →{" "}
                    {booking.trip.destination}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {longDate(booking.trip.departureAt)} ·{" "}
                    {clockTime(booking.trip.departureAt)} · Seat
                    {booking.seats.length > 1 ? "s" : ""}{" "}
                    {booking.seats.join(", ")}
                  </p>
                </div>

                <p className="font-bold">{naira(booking.amount)}</p>

                {booking.status === "paid" ? (
                  <Link href={`/tickets/${booking.reference}`} className="btn-ghost">
                    View ticket
                  </Link>
                ) : booking.status === "pending" ? (
                  <ResumePaymentButton reference={booking.reference} />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
