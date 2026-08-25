import mongoose from "mongoose";

/**
 * A seat that is no longer free. Seats are only written here when a passenger
 * actually claims them, so an empty array means an empty vehicle.
 *   held -> a booking is in progress, released automatically when it expires
 *   paid -> permanently taken
 */
const SeatSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    status: { type: String, enum: ["held", "paid"], required: true },
    bookingRef: { type: String, required: true },
    holdExpiresAt: { type: Date },
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    operator: { type: String, required: true }, // e.g. "BRT", "LAGFERRY"
    mode: { type: String, enum: ["bus", "ferry", "rail"], required: true },
    routeCode: { type: String, required: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departureAt: { type: Date, required: true },
    arrivalAt: { type: Date, required: true },
    fare: { type: Number, required: true }, // naira
    vehicleLabel: { type: String, required: true }, // e.g. "BRT-042"
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    seats: { type: [SeatSchema], default: [] },
  },
  { timestamps: true }
);

// Supports the route + date search on the home page.
TripSchema.index({ origin: 1, destination: 1, departureAt: 1 });

TripSchema.virtual("capacity").get(function () {
  return this.rows * this.columns;
});

/** Every seat label the vehicle has, in display order: A1, A2, B1 ... */
TripSchema.methods.seatMap = function () {
  const taken = new Map(this.seats.map((s) => [s.number, s.status]));
  const now = Date.now();
  const grid = [];

  for (let r = 0; r < this.rows; r++) {
    const row = [];
    for (let c = 1; c <= this.columns; c++) {
      const number = `${String.fromCharCode(65 + r)}${c}`;
      const seat = this.seats.find((s) => s.number === number);
      // A hold that has run out is shown as available again.
      const expired =
        seat?.status === "held" && seat.holdExpiresAt?.getTime() < now;
      row.push({
        number,
        status: !seat || expired ? "available" : taken.get(number),
      });
    }
    grid.push(row);
  }
  return grid;
};

TripSchema.methods.seatsLeft = function () {
  const now = Date.now();
  const gone = this.seats.filter(
    (s) => s.status === "paid" || (s.holdExpiresAt?.getTime() ?? 0) > now
  ).length;
  return this.rows * this.columns - gone;
};

export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
