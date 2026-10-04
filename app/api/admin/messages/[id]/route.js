import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { requireAdmin } from "@/lib/auth";

/** Mark an enquiry as dealt with, or put it back in the queue. */
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { handled } = await request.json();

    await connectDB();
    const message = await Message.findByIdAndUpdate(
      id,
      { $set: { handled: Boolean(handled) } },
      { new: true }
    );
    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }
    return NextResponse.json({ handled: message.handled });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
