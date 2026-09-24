import Link from "next/link";
import connectDB from "@/lib/db";
import { getPlatformStats, last7Days, OCCUPANCY_WINDOW_DAYS } from "@/lib/stats";
import StatTile from "@/components/admin/StatTile";
import BarRows from "@/components/admin/BarRows";
import RevenueChart from "@/components/admin/RevenueChart";
import { naira, clockTime, longDate, MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview — Lagos OTRS Admin" };

const STATUS_STYLE = {
  paid: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  expired: "bg-canvas text-muted",
};

export default async function AdminOverviewPage() {
  await connectDB();
  const stats = await getPlatformStats();
  const days = last7Days(stats.dailyRevenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted">
          How the platform is performing right now.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Revenue collected"
          value={naira(stats.revenue)}
          sub={`${stats.paidBookings} paid booking${stats.paidBookings === 1 ? "" : "s"}`}
          tone="brand"
        />
        <StatTile
          label="Seats sold"
          value={stats.seatsSold.toLocaleString("en-NG")}
          sub={`${stats.boarded} passenger${stats.boarded === 1 ? "" : "s"} boarded`}
        />
        <StatTile
          label="Registered passengers"
          value={stats.passengers.toLocaleString("en-NG")}
          sub={`${stats.totalBookings} bookings all time`}
        />
        <StatTile
          label="Upcoming departures"
          value={stats.upcomingTrips.toLocaleString("en-NG")}
          sub={`${stats.occupancy}% of seats sold in the next ${OCCUPANCY_WINDOW_DAYS} days`}
        />
      </section>

      {stats.pendingBookings > 0 && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm">
          <strong>{stats.pendingBookings}</strong> booking
          {stats.pendingBookings === 1 ? " is" : "s are"} awaiting payment, worth{" "}
          <strong>{naira(stats.pendingValue)}</strong>. Seats are released
          automatically if payment is not completed within 10 minutes.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">Revenue, last 7 days</h2>
          <p className="mb-4 text-xs text-muted">
            Paid bookings by the day they were made.
          </p>
          <RevenueChart days={days} format={naira} />
        </div>

        <div className="card p-5">
          <h2 className="font-semibold">Revenue by mode of transport</h2>
          <p className="mb-4 text-xs text-muted">
            Where the money is coming from.
          </p>
          <BarRows
            rows={stats.byMode.map((row) => ({
              label: MODE_LABEL[row._id] || row._id,
              value: row.revenue,
              note: `${row.seats} seat${row.seats === 1 ? "" : "s"} sold`,
            }))}
            format={naira}
            empty="No paid bookings yet."
          />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Busiest routes</h2>
        <p className="mb-4 text-xs text-muted">
          Your six highest-earning corridors.
        </p>
        <BarRows
          rows={stats.topRoutes.map((row) => ({
            label: `${row._id.origin} → ${row._id.destination}`,
            value: row.revenue,
            note: `${row.bookings} booking${row.bookings === 1 ? "" : "s"} · ${
              row.seats
            } seats · ${MODE_LABEL[row._id.mode]}`,
          }))}
          format={naira}
          empty="No paid bookings yet."
        />
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h2 className="font-semibold">Latest bookings</h2>
            <p className="text-xs text-muted">The last eight, newest first.</p>
          </div>
          <Link href="/admin/bookings" className="btn-ghost !py-2">
            See all
          </Link>
        </div>

        {stats.recentBookings.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No bookings yet.</p>
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
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.reference} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-2.5 font-mono text-xs">{booking.reference}</td>
                    <td className="px-5 py-2.5">{booking.passengerName}</td>
                    <td className="px-5 py-2.5">
                      {booking.trip
                        ? `${booking.trip.origin} → ${booking.trip.destination}`
                        : "—"}
                      {booking.trip && (
                        <span className="block text-xs text-muted">
                          {longDate(booking.trip.departureAt)} ·{" "}
                          {clockTime(booking.trip.departureAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">{booking.seats.join(", ")}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {naira(booking.amount)}
                    </td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_STYLE[booking.status]
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
