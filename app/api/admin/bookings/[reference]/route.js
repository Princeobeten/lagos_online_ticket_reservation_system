import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireAdmin } from "@/lib/auth";
import { cancelBooking } from "@/lib/settle";

/** The owner cancels a booking and puts the seats back on sale. */
export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();
    const { reference } = await params;

    await connectDB();
    const booking = await Booking.findOne({ reference });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Already cancelled." }, { status: 400 });
    }
    if (booking.ticket?.checkedInAt) {
      return NextResponse.json(
        { error: "This passenger has already boarded." },
        { status: 409 }
      );
    }

    await cancelBooking(booking);
    return NextResponse.json({ cancelled: booking.reference });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
