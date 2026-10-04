/** Shared field rules, so the register, reset and account forms agree. */

export const MIN_PASSWORD = 8;

export function checkPassword(password, confirmation) {
  if (!password || password.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain both letters and numbers.";
  }
  if (confirmation !== undefined && password !== confirmation) {
    return "The two passwords do not match.";
  }
  return null;
}

/** Accepts 08031234567, +2348031234567, 0803 123 4567. */
export function checkPhone(value, label = "Phone number") {
  const digits = (value || "").replace(/[\s-]/g, "");
  if (!digits) return `${label} is required.`;
  if (!/^(\+?234|0)\d{10}$/.test(digits)) {
    return `${label} must be a valid Nigerian number, e.g. 08031234567.`;
  }
  return null;
}

export function checkEmail(value) {
  if (!value) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email address.";
  }
  return null;
}

export function checkAddress(value) {
  if (!value || value.trim().length < 6) {
    return "Enter your home address so we can reach you if a trip changes.";
  }
  return null;
}
