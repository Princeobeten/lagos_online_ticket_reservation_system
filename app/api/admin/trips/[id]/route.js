import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import Booking from "@/models/Booking";
import { requireAdmin } from "@/lib/auth";
import { readTrip } from "../route";
import { releaseExpiredHolds } from "@/lib/reservation";

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { trip, errors } = readTrip(await request.json());
    if (errors.length) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    await connectDB();
    await releaseExpiredHolds(id); // ignore abandoned checkouts
    const existing = await Trip.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    // Shrinking a vehicle below a seat that is already sold -- or is being paid
    // for at this moment -- would strand that passenger, so the seat map is
    // checked before the size changes.
    const claimed = existing.seats;
    const wouldStrand = claimed.filter((seat) => {
      const row = seat.number.charCodeAt(0) - 65;
      const column = Number(seat.number.slice(1));
      return row >= trip.rows || column > trip.columns;
    });
    if (wouldStrand.length) {
      return NextResponse.json(
        {
          error: `Cannot shrink this vehicle: seat${
            wouldStrand.length > 1 ? "s" : ""
          } ${wouldStrand.map((s) => s.number).join(", ")} ${
            wouldStrand.length > 1 ? "have" : "has"
          } already been sold.`,
        },
        { status: 409 }
      );
    }

    Object.assign(existing, trip);
    await existing.save();
    return NextResponse.json({ id: existing._id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await connectDB();

    // Never delete a trip somebody holds a paid ticket for.
    const sold = await Booking.countDocuments({ trip: id, status: "paid" });
    if (sold > 0) {
      return NextResponse.json(
        {
          error: `This trip has ${sold} paid booking${
            sold > 1 ? "s" : ""
          }. Cancel those bookings first if the trip is not running.`,
        },
        { status: 409 }
      );
    }

    // Somebody may be at the payment screen for this trip right now.
    await releaseExpiredHolds(id);
    const trip = await Trip.findById(id);
    if (trip?.seats.length) {
      return NextResponse.json(
        {
          error: `${trip.seats.length} seat${
            trip.seats.length > 1 ? "s are" : " is"
          } being paid for right now. Try again in a few minutes.`,
        },
        { status: 409 }
      );
    }

    const removed = await Trip.findByIdAndDelete(id);
    if (!removed) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
