import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import { releaseExpiredHolds } from "@/lib/reservation";

/** Live seat map for one trip -- polled by the seat picker. */
export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    await releaseExpiredHolds(id);

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: trip._id.toString(),
      operator: trip.operator,
      mode: trip.mode,
      origin: trip.origin,
      destination: trip.destination,
      departureAt: trip.departureAt,
      arrivalAt: trip.arrivalAt,
      fare: trip.fare,
      vehicleLabel: trip.vehicleLabel,
      seatsLeft: trip.seatsLeft(),
      seatMap: trip.seatMap(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
