import Link from "next/link";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import CancelBookingButton from "@/components/admin/CancelBookingButton";
import { naira, clockTime, longDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings — Lagos OTRS Admin" };

const STATUS_STYLE = {
  paid: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  expired: "bg-canvas text-muted",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Awaiting payment" },
  { key: "boarded", label: "Boarded" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function AdminBookingsPage({ searchParams }) {
  const { status = "all", q } = await searchParams;

  await connectDB();
  const query = {};
  if (status === "boarded") query["ticket.checkedInAt"] = { $ne: null };
  else if (status !== "all") query.status = status;

  if (q) {
    const rx = { $regex: q.trim(), $options: "i" };
    query.$or = [{ reference: rx }, { passengerName: rx }, { passengerEmail: rx }, { passengerPhone: rx }];
  }

  const [bookings, counts] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).limit(150).populate("trip"),
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Bookings</h1>
        <p className="text-sm text-muted">
          Every reservation on the platform, newest first.
        </p>
      </div>

      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={`/admin/bookings?status=${filter.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                status === filter.key
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {filter.label}
              {byStatus[filter.key] != null && (
                <span className="ml-1.5 opacity-70">{byStatus[filter.key]}</span>
              )}
            </Link>
          ))}
        </div>

        <form className="ml-auto flex gap-2" action="/admin/bookings">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={q || ""}
            className="input !py-2 w-56"
            placeholder="Reference, name, email, phone"
          />
          <button className="btn-ghost !py-2">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No bookings match that filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Reference</th>
                  <th className="px-5 py-2.5 font-medium">Passenger</th>
                  <th className="px-5 py-2.5 font-medium">Trip</th>
                  <th className="px-5 py-2.5 font-medium">Seats</th>
                  <th className="px-5 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.reference} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs">{booking.reference}</span>
                      <span className="block text-xs text-muted">
                        {longDate(booking.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {booking.passengerName}
                      <span className="block text-xs text-muted">
                        {booking.passengerPhone}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {booking.trip
                        ? `${booking.trip.origin} → ${booking.trip.destination}`
                        : "— trip removed —"}
                      {booking.trip && (
                        <span className="block text-xs text-muted">
                          {longDate(booking.trip.departureAt)} ·{" "}
                          {clockTime(booking.trip.departureAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">{booking.seats.join(", ")}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {naira(booking.amount)}
                      {booking.payment?.channel && (
                        <span className="block text-xs text-muted">
                          {booking.payment.channel}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_STYLE[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.ticket?.checkedInAt && (
                        <span className="mt-1 block text-xs text-muted">
                          Boarded {clockTime(booking.ticket.checkedInAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {booking.status !== "cancelled" && !booking.ticket?.checkedInAt ? (
                        <CancelBookingButton reference={booking.reference} />
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
