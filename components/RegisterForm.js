"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MIN_PASSWORD } from "@/lib/validation";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  nextOfKinName: "",
  nextOfKinPhone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm({ next = "/tickets" }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
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

    const res = await fetch("/api/auth/register", {
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

    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        You only need an account once — every ticket you buy stays here.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-muted">
            Your details
          </legend>

          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" className="input" required autoComplete="name"
              value={form.fullName} onChange={set("fullName")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" type="email" className="input" required
                autoComplete="email" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone number</label>
              <input id="phone" className="input" required autoComplete="tel"
                inputMode="tel" placeholder="08031234567"
                value={form.phone} onChange={set("phone")} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="address">Home address</label>
            <textarea id="address" className="input min-h-20" required rows={2}
              autoComplete="street-address"
              placeholder="12 Herbert Macaulay Way, Yaba, Lagos"
              value={form.address} onChange={set("address")} />
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-muted">
            Next of kin
          </legend>
          <p className="text-xs text-muted">
            Who we should contact on your behalf in an emergency.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="nextOfKinName">Full name</label>
              <input id="nextOfKinName" className="input"
                value={form.nextOfKinName} onChange={set("nextOfKinName")} />
            </div>
            <div>
              <label className="label" htmlFor="nextOfKinPhone">Phone contact</label>
              <input id="nextOfKinPhone" className="input" required inputMode="tel"
                placeholder="08039876543"
                value={form.nextOfKinPhone} onChange={set("nextOfKinPhone")} />
            </div>
          </div>
        </fieldset>

        <fieldset className="card space-y-4 p-5">
          <legend className="px-1 text-sm font-semibold text-muted">
            Choose a password
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" required
                autoComplete="new-password" value={form.password}
                onChange={set("password")} />
              <p className="mt-1 text-xs text-muted">
                At least {MIN_PASSWORD} characters, with letters and numbers.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" type="password"
                className={`input ${mismatch ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                required autoComplete="new-password"
                aria-invalid={mismatch}
                value={form.confirmPassword} onChange={set("confirmPassword")} />
              {mismatch && (
                <p className="mt-1 text-xs font-medium text-red-700">
                  The two passwords do not match.
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {error && <p className="alert-error">{error}</p>}

        <button className="btn-primary w-full" disabled={busy || mismatch}>
          {busy ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
