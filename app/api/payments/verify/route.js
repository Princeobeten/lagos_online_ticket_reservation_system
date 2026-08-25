import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { settleBooking } from "@/lib/settle";

/**
 * Confirms a payment with the gateway and issues the ticket.
 * The browser redirect alone is never treated as proof of payment.
 */
export async function POST(request) {
  try {
    const user = await requireUser();
    const { reference, simulate } = await request.json();

    await connectDB();
    const result = await settleBooking(reference, { simulate, userId: user._id });

    if (!result.ok) {
      return NextResponse.json(
        {
          error:
            result.reason === "not-found"
              ? "Booking not found."
              : "We could not confirm your payment. Please try again.",
        },
        { status: result.reason === "not-found" ? 404 : 402 }
      );
    }

    return NextResponse.json({ reference: result.booking.reference });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
