import GateLookup from "@/components/GateLookup";

export const metadata = { title: "Ticket validation — Lagos OTRS" };

export default function VerifyIndexPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Ticket validation</h1>
        <p className="mt-1 text-sm text-muted">
          Point a phone camera at the passenger&apos;s QR code to open their
          ticket, or type the booking reference below.
        </p>
      </div>
      <GateLookup />
    </div>
  );
}
