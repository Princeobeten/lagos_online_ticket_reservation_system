"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MIN_PASSWORD } from "@/lib/validation";

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const mismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...form }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setBusy(false);
      return;
    }

    router.push(data.role === "admin" ? "/admin" : "/tickets");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="text-2xl font-bold">Reset link missing</h1>
        <p className="mt-2 text-sm text-muted">
          Open the link from your email, or request a new one.
        </p>
        <Link href="/forgot-password" className="btn-primary mt-5">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <p className="mt-1 text-sm text-muted">
        You will be signed in once it is saved.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input id="password" type="password" className="input" required
            autoComplete="new-password" value={form.password} onChange={set("password")} />
          <p className="mt-1 text-xs text-muted">
            At least {MIN_PASSWORD} characters, with letters and numbers.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" type="password"
            className={`input ${mismatch ? "border-red-300" : ""}`} required
            aria-invalid={mismatch}
            autoComplete="new-password" value={form.confirmPassword}
            onChange={set("confirmPassword")} />
          {mismatch && (
            <p className="mt-1 text-xs font-medium text-red-700">
              The two passwords do not match.
            </p>
          )}
        </div>

        {error && <p className="alert-error">{error}</p>}

        <button className="btn-primary w-full" disabled={busy || mismatch}>
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
