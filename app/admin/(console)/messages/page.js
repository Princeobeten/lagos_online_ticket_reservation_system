import Link from "next/link";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import MessageToggle from "@/components/admin/MessageToggle";
import { longDate, clockTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages — Lagos OTRS Admin" };

const SUBJECT_LABEL = {
  booking: "Booking",
  payment: "Payment",
  refund: "Refund",
  complaint: "Complaint",
  other: "Other",
};

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "handled", label: "Handled" },
  { key: "all", label: "All" },
];

export default async function AdminMessagesPage({ searchParams }) {
  const { show = "open" } = await searchParams;

  await connectDB();
  const query =
    show === "all" ? {} : { handled: show === "handled" };

  const [messages, open] = await Promise.all([
    Message.find(query).sort({ createdAt: -1 }).limit(100).lean(),
    Message.countDocuments({ handled: false }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted">
          Enquiries sent through the Contact us page.
          {open > 0 && ` ${open} still open.`}
        </p>
      </div>

      <div className="card flex flex-wrap gap-1 p-3">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            href={`/admin/messages?show=${filter.key}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              show === filter.key
                ? "bg-brand-600 text-white"
                : "text-muted hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">
          No messages here.
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message._id.toString()} className="card p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1 basis-full sm:basis-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                      {SUBJECT_LABEL[message.subject]}
                    </span>
                    {message.handled && (
                      <span className="rounded-full bg-canvas px-2 py-0.5 text-muted">
                        Handled
                      </span>
                    )}
                    {message.bookingReference && (
                      <span className="font-mono text-muted">
                        {message.bookingReference}
                      </span>
                    )}
                    <span className="text-muted">
                      {longDate(message.createdAt)} · {clockTime(message.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1.5 font-semibold">{message.name}</p>
                  <p className="text-xs text-muted">
                    {message.email}
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${message.email}?subject=Re: your enquiry${
                      message.bookingReference ? ` (${message.bookingReference})` : ""
                    }`}
                    className="btn-ghost !py-1.5 !px-3 text-xs"
                  >
                    Reply by email
                  </a>
                  <MessageToggle
                    id={message._id.toString()}
                    handled={message.handled}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
