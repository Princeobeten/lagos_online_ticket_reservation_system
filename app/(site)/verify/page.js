import Link from "next/link";
import GateLookup from "@/components/GateLookup";

export const metadata = { title: "Ticket validation — Lagos OTRS" };

export default function VerifyIndexPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Ticket validation</h1>
        <p className="mt-1 text-sm text-muted">
          Scan the passenger&apos;s QR code, or type their booking reference.
        </p>
      </div>

      <Link href="/verify/scan" className="btn-primary w-full py-4 text-base">
        <span aria-hidden="true">▣</span> Scan QR code
      </Link>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <GateLookup />
    </div>
  );
}
