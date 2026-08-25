import Trip from "@/models/Trip";

/**
 * Objective 1: searching routes and schedules.
 * Origin/destination match on a case-insensitive prefix so "iko" finds
 * "Ikorodu"; the date narrows results to that calendar day.
 */
export async function searchTrips({ origin, destination, date, mode } = {}) {
  const query = {};

  if (origin) query.origin = { $regex: `^${escapeRegex(origin)}`, $options: "i" };
  if (destination)
    query.destination = { $regex: `^${escapeRegex(destination)}`, $options: "i" };
  if (mode) query.mode = mode;

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.departureAt = { $gte: start, $lt: end };
  } else {
    query.departureAt = { $gte: new Date() }; // never show trips that have left
  }

  return Trip.find(query).sort({ departureAt: 1 }).limit(50);
}

function escapeRegex(value) {
  return value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
