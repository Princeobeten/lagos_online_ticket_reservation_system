import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { fullName, email, phone, password } = await request.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash: await hashPassword(password),
    });

    await createSession(user._id);
    return NextResponse.json({ user: user.toPublic() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
