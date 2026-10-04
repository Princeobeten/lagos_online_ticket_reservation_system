import { getCurrentUser } from "@/lib/auth";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact us — Lagos OTRS" };
export const dynamic = "force-dynamic";

const CHANNELS = [
  {
    label: "Customer care line",
    value: "0700 LAGOS BUS",
    note: "Monday to Saturday, 6:00 – 21:00",
  },
  {
    label: "Email",
    value: "support@lagosotrs.example",
    note: "We reply within one working day",
  },
  {
    label: "Head office",
    value: "Lagos State Transport Company, Oshodi Transport Interchange, Lagos",
    note: "Open on weekdays, 8:00 – 16:00",
  },
];

const TERMINALS = [
  ["Oshodi Transport Interchange", "Bus"],
  ["TBS / CMS Terminal", "Bus and ferry"],
  ["Ikorodu Terminal", "Bus and ferry"],
  ["Marina Station", "Rail"],
  ["Agbado Station", "Rail"],
];

export default async function ContactPage() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact us</h1>
        <p className="text-sm text-muted">
          Questions about a booking, a payment or a refund? Reach us whichever
          way suits you.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <ContactForm
          user={
            user
              ? { fullName: user.fullName, email: user.email, phone: user.phone }
              : null
          }
        />

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold">Other ways to reach us</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {CHANNELS.map((channel) => (
                <div key={channel.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    {channel.label}
                  </dt>
                  <dd className="font-medium">{channel.value}</dd>
                  <dd className="text-xs text-muted">{channel.note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold">Terminals</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {TERMINALS.map(([name, modes]) => (
                <li key={name} className="flex justify-between gap-3">
                  <span>{name}</span>
                  <span className="shrink-0 text-xs text-muted">{modes}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
