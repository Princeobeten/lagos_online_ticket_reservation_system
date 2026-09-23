import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import TripForm from "@/components/admin/TripForm";
import { naira } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit trip — Lagos OTRS Admin" };

export default async function EditTripPage({ params }) {
  const { id } = await params;

  await connectDB();
  const trip = await Trip.findById(id).catch(() => null);
  if (!trip) notFound();

  const sold = trip.seats.filter((s) => s.status === "paid");
  const held = trip.seats.filter((s) => s.status === "held");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/trips" className="text-sm text-muted hover:text-ink">
        ← Back to trips
      </Link>
      <div>
        <h1 className="text-2xl font-bold">
          {trip.origin} → {trip.destination}
        </h1>
        <p className="text-sm text-muted">
          {sold.length} seat{sold.length === 1 ? "" : "s"} sold
          {held.length > 0 && `, ${held.length} being paid for right now`} ·
          earned {naira(sold.length * trip.fare)}
        </p>
      </div>

      {sold.length > 0 && (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm">
          Passengers already hold tickets for this departure. Changing the time or
          route will change their ticket too — and the vehicle cannot be made
          smaller than the seats already sold ({sold.map((s) => s.number).join(", ")}).
        </div>
      )}

      <TripForm
        trip={{
          id: trip._id.toString(),
          operator: trip.operator,
          mode: trip.mode,
          routeCode: trip.routeCode,
          origin: trip.origin,
          destination: trip.destination,
          vehicleLabel: trip.vehicleLabel,
          fare: trip.fare,
          rows: trip.rows,
          columns: trip.columns,
          departureAt: trip.departureAt,
          arrivalAt: trip.arrivalAt,
        }}
      />
    </div>
  );
}
