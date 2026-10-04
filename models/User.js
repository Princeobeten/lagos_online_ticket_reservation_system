import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    nextOfKinName: { type: String, trim: true, default: "" },
    nextOfKinPhone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["passenger", "admin"], default: "passenger" },

    // Set when a password reset is requested. The token itself is never
    // stored -- only its hash -- so a database leak cannot be used to
    // take over accounts.
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Never leak the password hash to the client.
UserSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    address: this.address,
    nextOfKinName: this.nextOfKinName,
    nextOfKinPhone: this.nextOfKinPhone,
    role: this.role,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
