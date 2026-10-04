import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkPhone, checkAddress } from "@/lib/validation";

/** Update the signed-in person's own contact and next-of-kin details. */
export async function PATCH(request) {
  try {
    const user = await requireUser();
    const { fullName, phone, address, nextOfKinName, nextOfKinPhone } =
      await request.json();

    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    const problem =
      checkPhone(phone) ||
      checkAddress(address) ||
      checkPhone(nextOfKinPhone, "Next of kin phone number");
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    await connectDB();
    user.fullName = fullName.trim();
    user.phone = phone.trim();
    user.address = address.trim();
    user.nextOfKinName = (nextOfKinName || "").trim();
    user.nextOfKinPhone = nextOfKinPhone.trim();
    await user.save();

    return NextResponse.json({ user: user.toPublic() });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
