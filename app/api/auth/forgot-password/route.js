import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { newResetToken, resetExpiry, RESET_TTL_MINUTES } from "@/lib/passwordReset";
import { sendPasswordReset } from "@/lib/mailer";
import { appUrl } from "@/lib/paystack";

export async function POST(request) {
  try {
    const { email } = await request.json();
    await connectDB();

    const user = await User.findOne({ email: (email || "").toLowerCase().trim() });

    // Always answer the same way. Otherwise this form would tell a stranger
    // which email addresses hold accounts.
    const answer = {
      sent: true,
      message:
        "If that email address has an account, a reset link is on its way. " +
        `The link expires in ${RESET_TTL_MINUTES} minutes.`,
    };

    if (!user) return NextResponse.json(answer);

    const { token, hash } = newResetToken();
    user.resetTokenHash = hash;
    user.resetTokenExpiresAt = resetExpiry();
    await user.save();

    const delivery = await sendPasswordReset({
      to: user.email,
      link: appUrl(`/reset-password?token=${token}`),
    });

    // No mail provider: hand the link back so the flow can still be completed.
    return NextResponse.json({ ...answer, demoLink: delivery.link ?? null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
