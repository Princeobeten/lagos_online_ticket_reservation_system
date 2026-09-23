import Link from "next/link";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import DeleteTripButton from "@/components/admin/DeleteTripButton";
import { naira, clockTime, longDate, MODE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Trips & schedules — Lagos OTRS Admin" };

export default async function AdminTripsPage({ searchParams }) {
  const { q, when = "upcoming" } = await searchParams;

  await connectDB();
  const query = {};
  if (when === "upcoming") query.departureAt = { $gte: new Date() };
  if (when === "past") query.departureAt = { $lt: new Date() };
  if (q) {
    const rx = { $regex: q.trim(), $options: "i" };
    query.$or = [
      { origin: rx }, { destination: rx }, { operator: rx },
      { routeCode: rx }, { vehicleLabel: rx },
    ];
  }

  const trips = await Trip.find(query)
    .sort({ departureAt: when === "past" ? -1 : 1 })
    .limit(150);

  const tabs = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trips &amp; schedules</h1>
          <p className="text-sm text-muted">
            Add departures, change fares and times, or withdraw a service.
          </p>
        </div>
        <Link href="/admin/trips/new" className="btn-primary">
          Add a trip
        </Link>
      </div>

      <div className="card flex flex-wrap items-center gap-3 p-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/trips?when=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                when === tab.key
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-canvas hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form className="ml-auto flex gap-2" action="/admin/trips">
          <input type="hidden" name="when" value={when} />
          <input
            name="q"
            defaultValue={q || ""}
            className="input !py-2 w-56"
            placeholder="Search route, operator, vehicle"
          />
          <button className="btn-ghost !py-2">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {trips.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No trips match. <Link href="/admin/trips/new" className="font-semibold text-brand-700 hover:underline">Add one</Link>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Route</th>
                  <th className="px-5 py-2.5 font-medium">Departs</th>
                  <th className="px-5 py-2.5 font-medium">Vehicle</th>
                  <th className="px-5 py-2.5 text-right font-medium">Fare</th>
                  <th className="px-5 py-2.5 font-medium">Seats</th>
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => {
                  const capacity = trip.rows * trip.columns;
                  const sold = trip.seats.filter((s) => s.status === "paid").length;
                  return (
                    <tr key={trip._id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-3">
                        <span className="font-semibold">
                          {trip.origin} → {trip.destination}
                        </span>
                        <span className="block text-xs text-muted">
                          {trip.operator} · {MODE_LABEL[trip.mode]} · {trip.routeCode}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {longDate(trip.departureAt)}
                        <span className="block text-xs text-muted">
                          {clockTime(trip.departureAt)} – {clockTime(trip.arrivalAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3">{trip.vehicleLabel}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{naira(trip.fare)}</td>
                      <td className="px-5 py-3">
                        <span className="tabular-nums">{sold}/{capacity}</span>
                        <span className="block text-xs text-muted">sold</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-start justify-end gap-3">
                          <Link
                            href={`/admin/trips/${trip._id}`}
                            className="text-sm font-medium text-brand-700 hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteTripButton
                            id={trip._id.toString()}
                            label={`${trip.origin} → ${trip.destination}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
