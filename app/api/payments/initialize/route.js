import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { requireUser } from "@/lib/auth";
import { initializePayment, isPaystackConfigured } from "@/lib/paystack";

/** Objective 3: hand the passenger over to the payment gateway. */
export async function POST(request) {
  try {
    const user = await requireUser();
    const { reference } = await request.json();

    await connectDB();
    const booking = await Booking.findOne({ reference, user: user._id });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    if (booking.status === "paid") {
      return NextResponse.json(
        { error: "This booking has already been paid for." },
        { status: 400 }
      );
    }
    if (booking.holdExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Your seat hold expired. Please select seats again." },
        { status: 410 }
      );
    }

    const payment = await initializePayment({ booking });

    booking.payment = {
      provider: payment.provider,
      reference: payment.reference,
    };
    await booking.save();

    return NextResponse.json({
      authorizationUrl: payment.authorizationUrl,
      live: isPaystackConfigured,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
