import crypto from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid misreads

/** Human-readable booking reference, e.g. LSTC-7F3K9A */
export function newBookingReference() {
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `LSTC-${out}`;
}
