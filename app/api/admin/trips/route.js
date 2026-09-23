import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import { requireAdmin } from "@/lib/auth";

const MODES = ["bus", "ferry", "rail"];

/** Validates one trip payload coming from the admin form. */
function readTrip(body) {
  const errors = [];
  const trip = {
    operator: (body.operator || "").trim(),
    mode: body.mode,
    routeCode: (body.routeCode || "").trim(),
    origin: (body.origin || "").trim(),
    destination: (body.destination || "").trim(),
    vehicleLabel: (body.vehicleLabel || "").trim(),
    fare: Number(body.fare),
    rows: Number(body.rows),
    columns: Number(body.columns),
    departureAt: new Date(body.departureAt),
    arrivalAt: new Date(body.arrivalAt),
  };

  if (!trip.operator) errors.push("Operator is required.");
  if (!MODES.includes(trip.mode)) errors.push("Choose bus, ferry or rail.");
  if (!trip.routeCode) errors.push("Route code is required.");
  if (!trip.origin) errors.push("Origin is required.");
  if (!trip.destination) errors.push("Destination is required.");
  if (trip.origin && trip.origin === trip.destination)
    errors.push("Origin and destination cannot be the same.");
  if (!trip.vehicleLabel) errors.push("Vehicle label is required.");
  if (!Number.isFinite(trip.fare) || trip.fare <= 0)
    errors.push("Fare must be greater than zero.");
  if (!Number.isInteger(trip.rows) || trip.rows < 1 || trip.rows > 26)
    errors.push("Rows must be between 1 and 26.");
  if (!Number.isInteger(trip.columns) || trip.columns < 1 || trip.columns > 10)
    errors.push("Columns must be between 1 and 10.");
  if (Number.isNaN(trip.departureAt.getTime())) errors.push("Departure time is not valid.");
  if (Number.isNaN(trip.arrivalAt.getTime())) errors.push("Arrival time is not valid.");
  if (trip.arrivalAt <= trip.departureAt)
    errors.push("Arrival must be after departure.");

  return { trip, errors };
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const trips = await Trip.find().sort({ departureAt: 1 }).limit(200);
    return NextResponse.json({ count: trips.length, trips });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    const { trip, errors } = readTrip(await request.json());
    if (errors.length) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    await connectDB();
    const created = await Trip.create(trip);
    return NextResponse.json({ id: created._id.toString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export { readTrip };
