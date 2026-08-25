import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { isValidWebhookSignature } from "@/lib/paystack";
import { settleBooking } from "@/lib/settle";

/**
 * Paystack calls this directly, server to server. It is what saves a booking
 * when the passenger closes the browser before being redirected back.
 */
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success") {
    await connectDB();
    await settleBooking(event.data.reference);
  }

  return NextResponse.json({ received: true });
}
