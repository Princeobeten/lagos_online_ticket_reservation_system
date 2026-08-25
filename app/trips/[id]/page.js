import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import { releaseExpiredHolds } from "@/lib/reservation";
import { getCurrentUser } from "@/lib/auth";
import SeatPicker from "@/components/SeatPicker";
import { naira, clockTime, longDate, MODE_LABEL, MODE_ICON } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TripPage({ params }) {
  const { id } = await params;

  await connectDB();
  await releaseExpiredHolds(id);

  const trip = await Trip.findById(id).catch(() => null);
  if (!trip) notFound();

  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <Link href="/trips" className="text-sm text-muted hover:text-ink">
        ← Back to search results
      </Link>

      <div className="card flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{MODE_ICON[trip.mode]}</span>
            <span className="font-semibold text-brand-700">{trip.operator}</span>
            <span>·</span>
            <span>{MODE_LABEL[trip.mode]}</span>
            <span>·</span>
            <span>{trip.vehicleLabel}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold">
            {trip.origin} → {trip.destination}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {longDate(trip.departureAt)} · {clockTime(trip.departureAt)} –{" "}
            {clockTime(trip.arrivalAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{naira(trip.fare)}</p>
          <p className="text-xs text-muted">{trip.seatsLeft()} seats left</p>
        </div>
      </div>

      <SeatPicker
        trip={{
          id: trip._id.toString(),
          mode: trip.mode,
          fare: trip.fare,
          columns: trip.columns,
          seatMap: trip.seatMap(),
        }}
        signedIn={Boolean(user)}
        passenger={user ? { fullName: user.fullName, phone: user.phone } : null}
      />
    </div>
  );
}
