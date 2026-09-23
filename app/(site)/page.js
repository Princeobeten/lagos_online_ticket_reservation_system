import Link from "next/link";
import SearchForm from "@/components/SearchForm";

const STEPS = [
  {
    title: "Search",
    body: "Pick your terminal, date and mode of transport to see every scheduled departure.",
  },
  {
    title: "Reserve",
    body: "Choose your exact seat from a live seat map. It is held for you for 10 minutes.",
  },
  {
    title: "Pay",
    body: "Complete payment through the gateway with your card, transfer or USSD.",
  },
  {
    title: "Board",
    body: "Your QR ticket is issued instantly. Show it at the gate and walk straight on.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Bus · Ferry · Rail
        </p>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Reserve your seat before you leave the house.
        </h1>
        <p className="max-w-2xl text-muted">
          Book any Lagos State Transport Company trip online, pay securely and
          board with a QR ticket. No queues at the terminal.
        </p>
      </section>

      <SearchForm />

      <section>
        <h2 className="mb-4 text-lg font-semibold">How it works</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-semibold">Working at a boarding gate?</h2>
          <p className="text-sm text-muted">
            Scan a passenger&apos;s QR code, or enter the booking reference by hand.
          </p>
        </div>
        <Link href="/verify" className="btn-ghost">
          Open ticket validation
        </Link>
      </section>
    </div>
  );
}
