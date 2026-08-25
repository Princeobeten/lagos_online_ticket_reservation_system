import crypto from "crypto";
import QRCode from "qrcode";
import { appUrl } from "@/lib/paystack";

/**
 * The QR code carries a short signature alongside the reference, so a ticket
 * cannot be forged by guessing or incrementing somebody else's booking code.
 */
export function signReference(reference) {
  const secret = process.env.JWT_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(reference)
    .digest("hex")
    .slice(0, 16);
}

export function isValidSignature(reference, signature) {
  const expected = signReference(reference);
  if (!signature || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Scanning the QR with any phone camera opens this validation page. */
export function ticketUrl(reference) {
  return appUrl(`/verify/${reference}?t=${signReference(reference)}`);
}

/** PNG data URL, so the ticket renders offline once the page has loaded. */
export function ticketQrDataUrl(reference) {
  return QRCode.toDataURL(ticketUrl(reference), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
