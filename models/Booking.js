import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true }, // LSTC-7F3K9A
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    seats: { type: [String], required: true },
    passengerName: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    amount: { type: Number, required: true }, // naira
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired"],
      default: "pending",
    },
    holdExpiresAt: { type: Date, required: true },
    payment: {
      provider: { type: String },
      reference: { type: String },
      channel: { type: String },
      paidAt: { type: Date },
    },
    ticket: {
      issuedAt: { type: Date },
      checkedInAt: { type: Date },
      checkedInGate: { type: String },
    },
  },
  { timestamps: true }
);

BookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
