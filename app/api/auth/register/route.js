import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { hashPassword, createSession } from "@/lib/auth";
import {
  checkPassword,
  checkPhone,
  checkEmail,
  checkAddress,
} from "@/lib/validation";

export async function POST(request) {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      nextOfKinName,
      nextOfKinPhone,
      password,
      confirmPassword,
    } = await request.json();

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { error: "Enter your full name." },
        { status: 400 }
      );
    }

    const problem =
      checkEmail(email) ||
      checkPhone(phone) ||
      checkAddress(address) ||
      checkPhone(nextOfKinPhone, "Next of kin phone number") ||
      checkPassword(password, confirmPassword);

    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 });
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
      fullName: fullName.trim(),
      email,
      phone: phone.trim(),
      address: address.trim(),
      nextOfKinName: (nextOfKinName || "").trim(),
      nextOfKinPhone: nextOfKinPhone.trim(),
      passwordHash: await hashPassword(password),
    });

    await createSession(user._id);
    return NextResponse.json({ user: user.toPublic() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
