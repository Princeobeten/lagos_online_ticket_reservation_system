"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm({ next = "/tickets" }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

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

    // An administrator has no use for a passenger ticket list.
    router.push(data.user.role === "admin" && next === "/tickets" ? "/admin" : next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to reserve seats and view your tickets.
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
            value={form.email}
            onChange={set("email")}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label className="label mb-0" htmlFor="password">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className="input"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={set("password")}
          />
        </div>

        {error && <p className="alert-error">{error}</p>}

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
