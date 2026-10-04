"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }
    setResult(data);
    setBusy(false);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted">{result.message}</p>

        {result.demoLink && (
          <div className="card mt-5 border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-900">
              No email service is connected
            </p>
            <p className="mt-1 text-amber-900/80">
              This prototype cannot send mail, so the reset link is shown here
              instead. Open it to choose a new password.
            </p>
            <Link
              href={result.demoLink.replace(/^https?:\/\/[^/]+/, "")}
              className="btn-primary mt-3 w-full"
            >
              Open reset link
            </Link>
          </div>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the email address on your account and we will send you a link to
        choose a new password.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="input"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="alert-error">{error}</p>}

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
