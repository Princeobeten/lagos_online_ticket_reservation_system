"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GateLookup() {
  const router = useRouter();
  const [reference, setReference] = useState("");

  function submit(event) {
    event.preventDefault();
    const clean = reference.trim().toUpperCase();
    if (clean) router.push(`/verify/${clean}`);
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div>
        <label className="label" htmlFor="reference">Booking reference</label>
        <input
          id="reference"
          className="input font-mono uppercase"
          placeholder="LSTC-7F3K9A"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </div>
      <button className="btn-primary w-full">Look up ticket</button>
    </form>
  );
}
