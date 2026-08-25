import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { isValidSignature } from "@/lib/ticket";

/**
 * Objective 4: the boarding gate scans the QR and confirms the passenger.
 * A ticket can only be used once -- the second scan reports it as already used.
 */
export async function POST(request, { params }) {
  try {
    const { reference } = await params;
    const { signature, gate } = await request.json();

    if (!isValidSignature(reference, signature)) {
      return NextResponse.json(
        { error: "This ticket could not be authenticated." },
        { status: 401 }
      );
    }

    await connectDB();

    // Only stamp the ticket if it has not been stamped already: the condition
    // and the write are one atomic operation, so a double scan cannot pass twice.
    const booking = await Booking.findOneAndUpdate(
      { reference, status: "paid", "ticket.checkedInAt": null },
      {
        $set: {
          "ticket.checkedInAt": new Date(),
          "ticket.checkedInGate": gate || "Gate 1",
        },
      },
      { new: true }
    ).populate("trip");

    if (!booking) {
      const existing = await Booking.findOne({ reference });
      if (!existing) {
        return NextResponse.json({ error: "Unknown ticket." }, { status: 404 });
      }
      if (existing.ticket?.checkedInAt) {
        return NextResponse.json(
          {
            error: "This ticket has already been used.",
            checkedInAt: existing.ticket.checkedInAt,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Ticket is not valid for boarding (status: ${existing.status}).` },
        { status: 409 }
      );
    }

    return NextResponse.json({
      boarded: true,
      passengerName: booking.passengerName,
      seats: booking.seats,
      trip: `${booking.trip.origin} to ${booking.trip.destination}`,
      checkedInAt: booking.ticket.checkedInAt,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
