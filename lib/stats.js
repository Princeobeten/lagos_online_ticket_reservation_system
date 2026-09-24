import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import User from "@/models/User";

/**
 * Everything the platform owner's dashboard shows.
 * All of it is derived from the bookings and trips already in the database --
 * nothing is stored twice, so the numbers cannot drift out of date.
 */
export const OCCUPANCY_WINDOW_DAYS = 7;

export async function getPlatformStats() {
  const now = new Date();

  const [
    byStatus,
    paidTotals,
    passengers,
    upcomingTrips,
    boarded,
    byMode,
    topRoutes,
    dailyRevenue,
    recentBookings,
    capacity,
  ] = await Promise.all([
    Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$amount" } } },
    ]),

    Booking.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          seats: { $sum: { $size: "$seats" } },
          bookings: { $sum: 1 },
        },
      },
    ]),

    User.countDocuments({ role: { $ne: "admin" } }),
    Trip.countDocuments({ departureAt: { $gte: now } }),
    Booking.countDocuments({ "ticket.checkedInAt": { $ne: null } }),

    // Revenue split across bus, ferry and rail
    Booking.aggregate([
      { $match: { status: "paid" } },
      { $lookup: { from: "trips", localField: "trip", foreignField: "_id", as: "trip" } },
      { $unwind: "$trip" },
      {
        $group: {
          _id: "$trip.mode",
          revenue: { $sum: "$amount" },
          seats: { $sum: { $size: "$seats" } },
        },
      },
      { $sort: { revenue: -1 } },
    ]),

    // Which corridors actually earn money
    Booking.aggregate([
      { $match: { status: "paid" } },
      { $lookup: { from: "trips", localField: "trip", foreignField: "_id", as: "trip" } },
      { $unwind: "$trip" },
      {
        $group: {
          _id: {
            origin: "$trip.origin",
            destination: "$trip.destination",
            mode: "$trip.mode",
          },
          revenue: { $sum: "$amount" },
          seats: { $sum: { $size: "$seats" } },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),

    // Last 7 days of takings
    Booking.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Booking.find().sort({ createdAt: -1 }).limit(8).populate("trip").lean(),

    // Seats offered vs sold over the coming week. Measuring this across the
    // whole published timetable would be meaningless -- months of departures
    // that nobody could have booked yet drag the figure to zero.
    Trip.aggregate([
      {
        $match: {
          departureAt: {
            $gte: now,
            $lt: new Date(now.getTime() + OCCUPANCY_WINDOW_DAYS * 86400000),
          },
        },
      },
      {
        $group: {
          _id: null,
          offered: { $sum: { $multiply: ["$rows", "$columns"] } },
          taken: {
            $sum: {
              $size: {
                $filter: {
                  input: "$seats",
                  as: "seat",
                  cond: { $eq: ["$$seat.status", "paid"] },
                },
              },
            },
          },
        },
      },
    ]),
  ]);

  const status = Object.fromEntries(
    byStatus.map((row) => [row._id, { count: row.count, value: row.value }])
  );
  const totals = paidTotals[0] || { revenue: 0, seats: 0, bookings: 0 };
  const seatUse = capacity[0] || { offered: 0, taken: 0 };

  return {
    revenue: totals.revenue,
    seatsSold: totals.seats,
    paidBookings: totals.bookings,
    pendingBookings: status.pending?.count || 0,
    pendingValue: status.pending?.value || 0,
    cancelledBookings: status.cancelled?.count || 0,
    totalBookings: byStatus.reduce((sum, row) => sum + row.count, 0),
    passengers,
    upcomingTrips,
    boarded,
    occupancy: seatUse.offered ? Math.round((seatUse.taken / seatUse.offered) * 100) : 0,
    seatsOffered: seatUse.offered,
    byMode,
    topRoutes,
    dailyRevenue,
    recentBookings,
  };
}

/** Fills in the days with no sales so the chart has no gaps. */
export function last7Days(dailyRevenue) {
  const found = new Map(dailyRevenue.map((d) => [d._id, d.revenue]));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({
      key,
      label: date.toLocaleDateString("en-NG", { weekday: "short" }),
      revenue: found.get(key) || 0,
    });
  }
  return days;
}
