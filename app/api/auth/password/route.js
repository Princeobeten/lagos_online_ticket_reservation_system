import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";
import { checkPassword } from "@/lib/validation";

/** Change the password of whoever is signed in — passenger or administrator. */
export async function POST(request) {
  try {
    const user = await requireUser();
    const { currentPassword, password, confirmPassword } = await request.json();

    if (!(await verifyPassword(currentPassword || "", user.passwordHash))) {
      return NextResponse.json(
        { error: "Your current password is not correct." },
        { status: 403 }
      );
    }

    const problem = checkPassword(password, confirmPassword);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    if (await verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Choose a password you have not used before." },
        { status: 400 }
      );
    }

    await connectDB();
    user.passwordHash = await hashPassword(password);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    return NextResponse.json({ changed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
