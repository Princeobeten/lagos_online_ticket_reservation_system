import Booking from "@/models/Booking";
import { verifyPayment } from "@/lib/paystack";
import { confirmSeats, releaseSeats } from "@/lib/reservation";

/**
 * The single place where a booking becomes a ticket.
 *
 * Called from the payment callback AND from the Paystack webhook, so it has to
 * be safe to run twice -- a booking that is already paid is simply returned.
 */
export async function settleBooking(reference, { simulate, userId } = {}) {
  // userId is supplied on the browser callback so a passenger can only settle
  // their own booking; the Paystack webhook omits it and matches on reference.
  const booking = await Booking.findOne({
    reference,
    ...(userId ? { user: userId } : {}),
  });
  if (!booking) return { ok: false, reason: "not-found" };
  if (booking.status === "paid") return { ok: true, booking };

  const result = await verifyPayment(
    booking.payment?.reference || reference,
    { simulate }
  );

  if (!result.success) {
    // Do not release the seats yet: the passenger may retry within the hold.
    return { ok: false, reason: "payment-failed", booking };
  }

  // Turn the temporary holds into permanent seats, then issue the ticket.
  await confirmSeats({ tripId: booking.trip, bookingRef: booking.reference });

  booking.status = "paid";
  booking.set("payment.provider", booking.payment?.provider || "paystack");
  booking.set("payment.reference", booking.payment?.reference || reference);
  booking.set("payment.channel", result.channel);
  booking.set("payment.paidAt", result.paidAt);
  booking.set("ticket.issuedAt", new Date());
  await booking.save();

  return { ok: true, booking };
}

/** Passenger walked away or cancelled before paying. */
export async function cancelBooking(booking) {
  await releaseSeats({ tripId: booking.trip, bookingRef: booking.reference });
  booking.status = "cancelled";
  await booking.save();
  return booking;
}
