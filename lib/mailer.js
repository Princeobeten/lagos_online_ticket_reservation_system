/**
 * There is no mail provider wired up for this prototype, so a reset link
 * cannot actually be emailed. Rather than pretend, the link is handed back to
 * the caller and shown on screen, clearly labelled as standing in for the
 * email — the same approach the sandbox checkout takes for payments.
 *
 * To send real email later, implement deliver() against a provider and return
 * { delivered: true }. Nothing else needs to change.
 */
export const mailConfigured = false;

export async function sendPasswordReset({ link }) {
  if (!mailConfigured) {
    return { delivered: false, link };
  }
  // A provider would be called here.
  return { delivered: true };
}
