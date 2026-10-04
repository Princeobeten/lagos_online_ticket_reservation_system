import crypto from "node:crypto";

export const RESET_TTL_MINUTES = 30;

/**
 * The token goes to the passenger; only its hash is kept. Someone who reads
 * the database still cannot reset anybody's password.
 */
export function newResetToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function resetExpiry() {
  return new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
}
