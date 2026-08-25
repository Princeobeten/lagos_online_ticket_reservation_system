import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { searchTrips } from "@/lib/trips";

/** GET /api/trips?origin=Ikorodu&destination=CMS&date=2026-08-22&mode=ferry */
export async function GET(request) {
  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const trips = await searchTrips({
      origin: params.get("origin"),
      destination: params.get("destination"),
      date: params.get("date"),
      mode: params.get("mode"),
    });

    return NextResponse.json({
      count: trips.length,
      trips: trips.map((trip) => ({
        id: trip._id.toString(),
        operator: trip.operator,
        mode: trip.mode,
        routeCode: trip.routeCode,
        origin: trip.origin,
        destination: trip.destination,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        fare: trip.fare,
        vehicleLabel: trip.vehicleLabel,
        seatsLeft: trip.seatsLeft(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
