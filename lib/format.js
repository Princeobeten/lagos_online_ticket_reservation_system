export function naira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

export function clockTime(value) {
  return new Date(value).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function longDate(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

export const MODE_LABEL = { bus: "Bus", ferry: "Ferry", rail: "Rail" };
export const MODE_ICON = { bus: "\u{1F68C}", ferry: "⛴", rail: "\u{1F686}" };
