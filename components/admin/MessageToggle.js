"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageToggle({ id, handled }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled: !handled }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={toggle} disabled={busy} className="btn-ghost !py-1.5 !px-3 text-xs">
      {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}
