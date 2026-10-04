import mongoose from "mongoose";

/** A message sent through the Contact us form. */
const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    subject: {
      type: String,
      enum: ["booking", "payment", "refund", "complaint", "other"],
      default: "other",
    },
    bookingReference: { type: String, trim: true, default: "" },
    body: { type: String, required: true, trim: true },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ createdAt: -1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
