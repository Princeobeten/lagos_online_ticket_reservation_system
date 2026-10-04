import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { getCurrentUser } from "@/lib/auth";
import { checkEmail } from "@/lib/validation";

const SUBJECTS = ["booking", "payment", "refund", "complaint", "other"];

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser().catch(() => null);

    const name = (body.name || user?.fullName || "").trim();
    const email = (body.email || user?.email || "").trim();
    const text = (body.body || "").trim();

    if (name.length < 3) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    const badEmail = checkEmail(email);
    if (badEmail) return NextResponse.json({ error: badEmail }, { status: 400 });
    if (text.length < 10) {
      return NextResponse.json(
        { error: "Please describe your enquiry in a little more detail." },
        { status: 400 }
      );
    }

    await connectDB();
    await Message.create({
      name,
      email,
      phone: (body.phone || user?.phone || "").trim(),
      subject: SUBJECTS.includes(body.subject) ? body.subject : "other",
      bookingReference: (body.bookingReference || "").trim().toUpperCase(),
      body: text,
    });

    return NextResponse.json({ received: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
