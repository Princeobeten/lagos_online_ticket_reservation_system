"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm({ denied }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    denied ? "That account is not an administrator." : ""
  );
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const res = await fetch("/api/auth/login", {
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

    // A passenger account must not be left holding an admin session.
    if (data.user.role !== "admin") {
      await fetch("/api/auth/logout", { method: "POST" });
      setError("That account is not an administrator.");
      setBusy(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white font-bold text-brand-900">
            LS
          </span>
          <h1 className="text-xl font-bold">Platform administration</h1>
          <p className="mt-1 text-sm text-white/70">
            Lagos State Transport Company
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Passenger?{" "}
          <Link href="/login" className="font-semibold text-white hover:underline">
            Sign in here instead
          </Link>
        </p>
      </div>
    </div>
  );
}
