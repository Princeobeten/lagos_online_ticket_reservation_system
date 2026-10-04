"use client";

import { useState } from "react";
import Link from "next/link";

const SUBJECTS = [
  { value: "booking", label: "A booking or seat" },
  { value: "payment", label: "A payment problem" },
  { value: "refund", label: "A refund request" },
  { value: "complaint", label: "A complaint" },
  { value: "other", label: "Something else" },
];

export default function ContactForm({ user }) {
  const [form, setForm] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: "booking",
    bookingReference: "",
    body: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <p className="text-3xl">✓</p>
        <h2 className="mt-3 text-lg font-bold">Thank you — we have your message</h2>
        <p className="mt-1 text-sm text-muted">
          Our customer care team replies within one working day. If your trip is
          today, please call the number on this page instead.
        </p>
        <Link href="/" className="btn-ghost mt-5">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="font-semibold">Send us a message</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" className="input" required value={form.name}
            onChange={set("name")} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="input" required
            value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number (optional)</label>
          <input id="phone" className="input" inputMode="tel" value={form.phone}
            onChange={set("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="subject">What is it about?</label>
          <select id="subject" className="input" value={form.subject}
            onChange={set("subject")}>
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bookingReference">
          Booking reference (if you have one)
        </label>
        <input id="bookingReference" className="input font-mono uppercase"
          placeholder="LSTC-7F3K9A" value={form.bookingReference}
          onChange={set("bookingReference")} />
      </div>

      <div>
        <label className="label" htmlFor="body">How can we help?</label>
        <textarea id="body" rows={5} className="input min-h-32" required
          value={form.body} onChange={set("body")} />
      </div>

      {error && <p className="alert-error">{error}</p>}

      <button className="btn-primary w-full sm:w-auto" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
