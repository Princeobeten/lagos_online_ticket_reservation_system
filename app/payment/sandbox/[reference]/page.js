import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Booking from "@/models/Booking";
import { getCurrentUser } from "@/lib/auth";
import SandboxGateway from "@/components/SandboxGateway";

export const dynamic = "force-dynamic";

export default async function SandboxPage({ params }) {
  const { reference } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/payment/sandbox/${reference}`);

  await connectDB();
  const booking = await Booking.findOne({
    reference,
    user: user._id,
  }).populate("trip");
  if (!booking) notFound();
  if (booking.status === "paid") redirect(`/tickets/${reference}`);

  return (
    <SandboxGateway
      booking={{
        reference: booking.reference,
        amount: booking.amount,
        seats: booking.seats,
        passengerEmail: booking.passengerEmail,
        route: `${booking.trip.origin} → ${booking.trip.destination}`,
      }}
    />
  );
}
