import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    await connectDB();

    const user = await User.findOne({ email: (email || "").toLowerCase() });
    // Same message either way, so the form cannot be used to discover
    // which email addresses are registered.
    const ok = user && (await verifyPassword(password || "", user.passwordHash));
    if (!ok) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    await createSession(user._id);
    return NextResponse.json({ user: user.toPublic() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
