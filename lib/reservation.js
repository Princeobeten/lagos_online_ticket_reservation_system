import Trip from "@/models/Trip";

export const HOLD_MINUTES = 10;

export class SeatUnavailableError extends Error {
  constructor(message = "One or more of the selected seats have just been taken.") {
    super(message);
    this.name = "SeatUnavailableError";
  }
}

/** Turn "A1" into row/column indexes so we can check it exists on this vehicle. */
export function isValidSeatNumber(number, rows, columns) {
  const match = /^([A-Z])(\d+)$/.exec(number);
  if (!match) return false;
  const row = match[1].charCodeAt(0) - 65;
  const column = Number(match[2]);
  return row >= 0 && row < rows && column >= 1 && column <= columns;
}

/**
 * Drop holds whose timer has run out, putting those seats back on the market.
 * Cheap enough to run before every reservation attempt.
 */
export async function releaseExpiredHolds(tripId) {
  await Trip.updateOne(
    { _id: tripId },
    { $pull: { seats: { status: "held", holdExpiresAt: { $lt: new Date() } } } }
  );
}

/**
 * The reservation algorithm.
 *
 * Two passengers tapping the same seat at the same moment must not both get it.
 * Rather than read-then-write (which leaves a gap where both reads say "free"),
 * the check and the claim are expressed as ONE conditional update:
 *
 *     match a trip whose seats array contains NONE of the requested numbers,
 *     and in the same operation push the requested numbers onto it.
 *
 * MongoDB guarantees a single document update is atomic, so exactly one of the
 * two concurrent requests can match; the loser gets null back and is told to
 * pick again. No transaction, no lock table, no double booking.
 */
export async function reserveSeats({ tripId, seats, bookingRef }) {
  await releaseExpiredHolds(tripId);

  const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
  const entries = seats.map((number) => ({
    number,
    status: "held",
    bookingRef,
    holdExpiresAt,
  }));

  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, "seats.number": { $nin: seats } }, // <- nobody holds these
    { $push: { seats: { $each: entries } } },         // <- claim them
    { new: true }
  );

  if (!trip) throw new SeatUnavailableError();
  return { trip, holdExpiresAt };
}

/** Payment succeeded: upgrade this booking's holds to permanent. */
export async function confirmSeats({ tripId, bookingRef }) {
  await Trip.updateOne(
    { _id: tripId },
    {
      $set: { "seats.$[claimed].status": "paid" },
      $unset: { "seats.$[claimed].holdExpiresAt": "" },
    },
    { arrayFilters: [{ "claimed.bookingRef": bookingRef }] }
  );
}

/** Payment failed, abandoned or cancelled: hand the seats back. */
export async function releaseSeats({ tripId, bookingRef }) {
  await Trip.updateOne(
    { _id: tripId },
    { $pull: { seats: { bookingRef, status: "held" } } }
  );
}
