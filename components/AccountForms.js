"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MIN_PASSWORD } from "@/lib/validation";

export function ProfileForm({ user }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    address: user.address || "",
    nextOfKinName: user.nextOfKinName || "",
    nextOfKinPhone: user.nextOfKinPhone || "",
  });
  const [state, setState] = useState({ error: "", ok: false, busy: false });

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setState({ error: "", ok: false, busy: true });

    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setState({ error: data.error, ok: false, busy: false });
      return;
    }
    setState({ error: "", ok: true, busy: false });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <h2 className="font-semibold">Your details</h2>
        <p className="text-sm text-muted">
          Used on your tickets and to reach you if a trip changes.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input id="fullName" className="input" required value={form.fullName}
          onChange={set("fullName")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" className="input bg-canvas text-muted" value={user.email}
            disabled readOnly />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" className="input" required inputMode="tel"
            value={form.phone} onChange={set("phone")} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="address">Home address</label>
        <textarea id="address" rows={2} className="input min-h-20" required
          value={form.address} onChange={set("address")} />
      </div>

      <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="nextOfKinName">Next of kin name</label>
          <input id="nextOfKinName" className="input" value={form.nextOfKinName}
            onChange={set("nextOfKinName")} />
        </div>
        <div>
          <label className="label" htmlFor="nextOfKinPhone">Next of kin phone contact</label>
          <input id="nextOfKinPhone" className="input" required inputMode="tel"
            value={form.nextOfKinPhone} onChange={set("nextOfKinPhone")} />
        </div>
      </div>

      {state.error && <p className="alert-error">{state.error}</p>}
      {state.ok && <p className="alert-ok">Your details have been saved.</p>}

      <button className="btn-primary" disabled={state.busy}>
        {state.busy ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [state, setState] = useState({ error: "", ok: false, busy: false });

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const mismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function submit(event) {
    event.preventDefault();
    setState({ error: "", ok: false, busy: true });

    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setState({ error: data.error, ok: false, busy: false });
      return;
    }
    setForm({ currentPassword: "", password: "", confirmPassword: "" });
    setState({ error: "", ok: true, busy: false });
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <h2 className="font-semibold">Change your password</h2>
        <p className="text-sm text-muted">
          You stay signed in on this device after changing it.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="currentPassword">Current password</label>
        <input id="currentPassword" type="password" className="input" required
          autoComplete="current-password" value={form.currentPassword}
          onChange={set("currentPassword")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" className="input" required
            autoComplete="new-password" value={form.password} onChange={set("password")} />
          <p className="mt-1 text-xs text-muted">
            At least {MIN_PASSWORD} characters, with letters and numbers.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="confirmNew">Confirm new password</label>
          <input id="confirmNew" type="password"
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
      </div>

      {state.error && <p className="alert-error">{state.error}</p>}
      {state.ok && <p className="alert-ok">Your password has been changed.</p>}

      <button className="btn-primary" disabled={state.busy || mismatch}>
        {state.busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
