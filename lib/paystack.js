import crypto from "crypto";

const BASE_URL = "https://api.paystack.co";
const SECRET = process.env.PAYSTACK_SECRET_KEY;

/**
 * With no Paystack key configured the app falls back to a clearly-labelled
 * sandbox screen, so the booking flow can still be demonstrated end to end.
 * Drop a real test key into .env.local and the same code path talks to Paystack.
 */
export const isPaystackConfigured = Boolean(SECRET);

export function appUrl(path = "") {
  const base = process.env.APP_URL || "http://localhost:3000";
  return `${base}${path}`;
}

/**
 * Ask Paystack to create a transaction and give us a checkout URL to send the
 * passenger to. Amounts are sent in kobo, hence the x100.
 */
export async function initializePayment({ booking }) {
  if (!isPaystackConfigured) {
    return {
      provider: "sandbox",
      reference: booking.reference,
      authorizationUrl: `/payment/sandbox/${booking.reference}`,
    };
  }

  const response = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: booking.passengerEmail,
      amount: booking.amount * 100,
      reference: booking.reference,
      callback_url: appUrl(`/payment/callback?reference=${booking.reference}`),
      metadata: {
        booking_reference: booking.reference,
        seats: booking.seats.join(", "),
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Could not start the payment.");
  }

  return {
    provider: "paystack",
    reference: payload.data.reference,
    authorizationUrl: payload.data.authorization_url,
  };
}

/**
 * Confirm with Paystack that the money actually landed. Never trust the browser
 * redirect on its own -- a passenger could simply visit the success URL.
 */
export async function verifyPayment(reference, { simulate } = {}) {
  if (!isPaystackConfigured) {
    return {
      success: simulate !== "failed",
      channel: "sandbox",
      paidAt: new Date(),
    };
  }

  const response = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${SECRET}` },
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || !payload.status) {
    return { success: false, channel: null, paidAt: null };
  }

  return {
    success: payload.data.status === "success",
    channel: payload.data.channel,
    paidAt: payload.data.paid_at ? new Date(payload.data.paid_at) : new Date(),
    amount: payload.data.amount / 100,
  };
}

/** Proves an incoming webhook really came from Paystack and not an attacker. */
export function isValidWebhookSignature(rawBody, signature) {
  if (!SECRET) return false;
  const expected = crypto
    .createHmac("sha512", SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
