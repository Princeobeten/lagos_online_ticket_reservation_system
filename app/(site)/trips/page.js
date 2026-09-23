import Link from "next/link";
import connectDB from "@/lib/db";
import { searchTrips } from "@/lib/trips";
import SearchForm from "@/components/SearchForm";
import { naira, clockTime, longDate, MODE_LABEL, MODE_ICON } from "@/lib/format";

export const dynamic = "force-dynamic"; // seat counts must never be cached

export default async function TripsPage({ searchParams }) {
  const params = await searchParams;
  await connectDB();
  const trips = await searchTrips(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available trips</h1>
        <p className="text-sm text-muted">
          {trips.length} departure{trips.length === 1 ? "" : "s"} found
          {params.date ? ` for ${longDate(params.date)}` : ""}.
        </p>
      </div>

      <SearchForm initial={params} />

      {trips.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium">No trips match that search.</p>
          <p className="mt-1 text-sm text-muted">
            Try another date, or clear the terminal names to see everything
            scheduled.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => {
            const seatsLeft = trip.seatsLeft();
            return (
              <li key={trip._id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>{MODE_ICON[trip.mode]}</span>
                      <span className="font-semibold text-brand-700">
                        {trip.operator}
                      </span>
                      <span>·</span>
                      <span>{MODE_LABEL[trip.mode]}</span>
                      <span>·</span>
                      <span>{trip.vehicleLabel}</span>
                    </div>

                    <h2 className="mt-1 truncate text-lg font-semibold">
                      {trip.origin} → {trip.destination}
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                      {longDate(trip.departureAt)} · departs{" "}
                      <strong className="text-ink">
                        {clockTime(trip.departureAt)}
                      </strong>{" "}
                      · arrives {clockTime(trip.arrivalAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">{naira(trip.fare)}</p>
                    <p
                      className={`text-xs ${
                        seatsLeft === 0
                          ? "text-red-600"
                          : seatsLeft <= 5
                            ? "text-amber-600"
                            : "text-muted"
                      }`}
                    >
                      {seatsLeft === 0
                        ? "Fully booked"
                        : `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`}
                    </p>
                  </div>

                  {seatsLeft === 0 ? (
                    <button className="btn-ghost" disabled>
                      Sold out
                    </button>
                  ) : (
                    <Link href={`/trips/${trip._id}`} className="btn-primary">
                      Select seats
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
