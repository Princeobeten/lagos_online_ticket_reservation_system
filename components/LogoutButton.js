"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ redirectTo = "/", tone = "light" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      disabled={busy}
      className={
        tone === "dark"
          ? "rounded-lg border border-white/25 px-3 py-1.5 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
          : "btn-ghost !py-2"
      }
    >
      Sign out
    </button>
  );
}
