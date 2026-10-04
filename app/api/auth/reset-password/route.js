import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, createSession } from "@/lib/auth";
import { hashToken } from "@/lib/passwordReset";
import { checkPassword } from "@/lib/validation";

export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();

    const problem = checkPassword(password, confirmPassword);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    await connectDB();

    const user = await User.findOne({
      resetTokenHash: hashToken(token || ""),
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(password);
    user.resetTokenHash = null; // a link works once
    user.resetTokenExpiresAt = null;
    await user.save();

    await createSession(user._id);
    return NextResponse.json({ reset: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
