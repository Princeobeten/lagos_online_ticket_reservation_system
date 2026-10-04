import Link from "next/link";
import QrScanner from "@/components/QrScanner";

export const metadata = { title: "Scan a ticket — Lagos OTRS" };

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link href="/verify" className="text-sm text-muted hover:text-ink">
        ← Ticket validation
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Scan a ticket</h1>
        <p className="mt-1 text-sm text-muted">
          Point the camera at the QR code on the passenger&apos;s ticket. It opens
          their boarding check automatically.
        </p>
      </div>
      <QrScanner />
    </div>
  );
}
