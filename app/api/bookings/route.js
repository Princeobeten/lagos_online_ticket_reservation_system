import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trip from "@/models/Trip";
import Booking from "@/models/Booking";
import { requireUser } from "@/lib/auth";
import { newBookingReference } from "@/lib/reference";
import {
  reserveSeats,
  releaseSeats,
  isValidSeatNumber,
  SeatUnavailableError,
  HOLD_MINUTES,
} from "@/lib/reservation";

/** The passenger's own bookings, newest first. */
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const bookings = await Booking.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("trip");

    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

/**
 * Objective 2: hold the chosen seats for this passenger.
 * The seats are only held (not sold) until payment clears, and the hold
 * expires by itself after HOLD_MINUTES so abandoned checkouts free up.
 */
export async function POST(request) {
  let claimed = null; // set once the seats are held, so we can undo it
  let created = null;

  try {
    const user = await requireUser();
    const { tripId, seats, passengerName, passengerPhone } =
      await request.json();

    if (!tripId || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { error: "Select at least one seat." },
        { status: 400 }
      );
    }
    if (seats.length > 5) {
      return NextResponse.json(
        { error: "You can book a maximum of 5 seats at a time." },
        { status: 400 }
      );
    }
    if (new Set(seats).size !== seats.length) {
      return NextResponse.json(
        { error: "The same seat was selected twice." },
        { status: 400 }
      );
    }

    await connectDB();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }
    if (trip.departureAt < new Date()) {
      return NextResponse.json(
        { error: "That trip has already departed." },
        { status: 400 }
      );
    }

    const invalid = seats.filter(
      (seat) => !isValidSeatNumber(seat, trip.rows, trip.columns)
    );
    if (invalid.length) {
      return NextResponse.json(
        { error: `Unknown seat: ${invalid.join(", ")}` },
        { status: 400 }
      );
    }

    const reference = newBookingReference();

    // Claim the seats first -- if this throws, no booking is written at all.
    const { holdExpiresAt } = await reserveSeats({
      tripId: trip._id,
      seats,
      bookingRef: reference,
    });
    claimed = { tripId: trip._id, bookingRef: reference };

    created = await Booking.create({
      reference,
      user: user._id,
      trip: trip._id,
      seats,
      passengerName: passengerName?.trim() || user.fullName,
      passengerPhone: passengerPhone?.trim() || user.phone,
      passengerEmail: user.email,
      amount: trip.fare * seats.length,
      status: "pending",
      holdExpiresAt,
    });

    return NextResponse.json(
      {
        booking: {
          reference: created.reference,
          seats: created.seats,
          amount: created.amount,
          holdExpiresAt: created.holdExpiresAt,
          holdMinutes: HOLD_MINUTES,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SeatUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    // Seats were claimed but writing the booking failed: put them back,
    // otherwise they would stay blocked until the hold expires.
    if (claimed && !created) {
      await releaseSeats(claimed);
    }
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
