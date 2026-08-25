/**
 * Loads the demo data used for the walkthrough: a set of real Lagos routes
 * across the next seven days, plus one passenger account to sign in with.
 *
 *   npm run seed
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

// Next.js reads .env.local automatically; a plain node script has to be told.
dotenv.config({ path: ".env.local", quiet: true });

const ROUTES = [
  // Bus Rapid Transit corridors
  { operator: "BRT", mode: "bus", routeCode: "BRT-01", origin: "Ikorodu", destination: "TBS", fare: 800, minutes: 75, times: ["05:30", "06:30", "07:30", "09:00", "16:00", "17:30", "19:00"] },
  { operator: "BRT", mode: "bus", routeCode: "BRT-02", origin: "TBS", destination: "Ikorodu", fare: 800, minutes: 75, times: ["07:00", "12:00", "16:30", "18:00", "20:00"] },
  { operator: "BRT", mode: "bus", routeCode: "BRT-03", origin: "Oshodi", destination: "Abule Egba", fare: 500, minutes: 45, times: ["06:00", "08:00", "13:00", "17:00", "19:30"] },
  { operator: "LAGBUS", mode: "bus", routeCode: "LB-11", origin: "Ikeja", destination: "CMS", fare: 700, minutes: 60, times: ["06:15", "07:45", "15:30", "18:15"] },
  { operator: "LAGBUS", mode: "bus", routeCode: "LB-14", origin: "Berger", destination: "CMS", fare: 750, minutes: 70, times: ["06:00", "07:00", "16:45", "18:30"] },

  // Lagos State Ferry Services
  { operator: "LAGFERRY", mode: "ferry", routeCode: "FR-01", origin: "Ikorodu", destination: "Falomo", fare: 1500, minutes: 40, times: ["06:30", "08:00", "16:00", "18:00"] },
  { operator: "LAGFERRY", mode: "ferry", routeCode: "FR-04", origin: "Badore", destination: "Ijede", fare: 1200, minutes: 35, times: ["07:00", "09:30", "17:00"] },
  { operator: "LAGFERRY", mode: "ferry", routeCode: "FR-07", origin: "Mile 2", destination: "CMS", fare: 1300, minutes: 30, times: ["06:45", "08:30", "17:15"] },

  // Rail Mass Transit
  { operator: "BLUE LINE", mode: "rail", routeCode: "RL-BL", origin: "Marina", destination: "Mile 2", fare: 750, minutes: 25, times: ["06:00", "07:00", "08:00", "16:00", "17:00", "18:00"] },
  { operator: "RED LINE", mode: "rail", routeCode: "RL-RD", origin: "Agbado", destination: "Oyingbo", fare: 900, minutes: 45, times: ["05:45", "07:15", "16:30", "18:15"] },
];

const LAYOUT = {
  bus: { rows: 8, columns: 4, vehicle: "BRT" },
  ferry: { rows: 10, columns: 4, vehicle: "BOAT" },
  rail: { rows: 12, columns: 5, vehicle: "TRAIN" },
};

const DAYS = 7;

function tripsForRoute(route, dayOffset) {
  const layout = LAYOUT[route.mode];

  return route.times.map((time, index) => {
    const [hour, minute] = time.split(":").map(Number);
    const departureAt = new Date();
    departureAt.setDate(departureAt.getDate() + dayOffset);
    departureAt.setHours(hour, minute, 0, 0);

    const arrivalAt = new Date(departureAt.getTime() + route.minutes * 60000);

    return {
      operator: route.operator,
      mode: route.mode,
      routeCode: route.routeCode,
      origin: route.origin,
      destination: route.destination,
      departureAt,
      arrivalAt,
      fare: route.fare,
      vehicleLabel: `${layout.vehicle}-${route.routeCode.slice(-2)}${index + 1}`,
      rows: layout.rows,
      columns: layout.columns,
      // A few seats already sold, so the seat map does not look untouched.
      seats: preSoldSeats(layout, dayOffset + index),
    };
  });
}

function preSoldSeats(layout, salt) {
  const count = (salt * 3) % 7; // 0-6 seats, varies per trip
  const seats = [];
  for (let i = 0; i < count; i++) {
    const row = (salt + i * 3) % layout.rows;
    const column = ((salt + i * 5) % layout.columns) + 1;
    const number = `${String.fromCharCode(65 + row)}${column}`;
    if (!seats.some((s) => s.number === number)) {
      seats.push({ number, status: "paid", bookingRef: "SEED" });
    }
  }
  return seats;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Copy .env.example to .env.local first.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  await Promise.all([
    Trip.deleteMany({}),
    Booking.deleteMany({}),
    User.deleteMany({ email: "demo@example.com" }),
  ]);

  const trips = [];
  for (let day = 0; day < DAYS; day++) {
    for (const route of ROUTES) {
      trips.push(...tripsForRoute(route, day));
    }
  }

  // Today's already-departed trips would only clutter the search results.
  const upcoming = trips.filter((trip) => trip.departureAt > new Date());
  await Trip.insertMany(upcoming);

  await User.create({
    fullName: "Demo Passenger",
    email: "demo@example.com",
    phone: "08030000000",
    passwordHash: await bcrypt.hash("password123", 10),
  });

  console.log(`Seeded ${upcoming.length} trips across ${ROUTES.length} routes.`);
  console.log("Demo login:  demo@example.com  /  password123");

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
