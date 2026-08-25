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
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["passenger", "admin"], default: "passenger" },
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
    role: this.role,
  };
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
