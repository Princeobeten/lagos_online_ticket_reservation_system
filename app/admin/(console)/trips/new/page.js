import Link from "next/link";
import TripForm from "@/components/admin/TripForm";

export const metadata = { title: "Add a trip — Lagos OTRS Admin" };

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/trips" className="text-sm text-muted hover:text-ink">
        ← Back to trips
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Add a trip</h1>
        <p className="text-sm text-muted">
          The departure goes on sale as soon as you save it.
        </p>
      </div>
      <TripForm />
    </div>
  );
}
