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
import crypto from "node:crypto";

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

/**
 * Departures are published from today through to the end of December, so the
 * timetable does not run dry mid-term. Re-running the seed always moves the
 * window forward to start from the day you run it.
 */
function daysThroughDecember() {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  const days = Math.ceil((endOfYear - now) / (24 * 60 * 60 * 1000));
  return Math.max(days, 7); // never seed less than a week
}

const DAYS = daysThroughDecember();

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
      seats: [], // filled in by seedBookings, so every sold seat has a booking
    };
  });
}

const DEMO_PASSENGERS = [
  ["Adaeze Nwosu", "adaeze@example.com", "08031110001"],
  ["Chinedu Obi", "chinedu@example.com", "08031110002"],
  ["Fatima Bello", "fatima@example.com", "08031110003"],
  ["Segun Adeyemi", "segun@example.com", "08031110004"],
  ["Ngozi Eze", "ngozi@example.com", "08031110005"],
];

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function reference() {
  let out = "";
  for (const b of crypto.randomBytes(6)) out += REF_ALPHABET[b % REF_ALPHABET.length];
  return `LSTC-${out}`;
}

/**
 * Gives the platform a believable trading history, so the administrator's
 * dashboard has revenue, routes and a booking feed to show straight after a
 * seed. Written directly rather than through the payment gateway, because a
 * gateway cannot be driven from a script.
 */
async function seedBookings() {
  const password = await bcrypt.hash("password123", 10);
  const people = [];
  for (const [fullName, email, phone] of DEMO_PASSENGERS) {
    people.push(
      await User.findOneAndUpdate(
        { email },
        { fullName, email, phone, passwordHash: password, role: "passenger" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );
  }

  // Only the nearest departures: real passengers book close to travel, and it
  // keeps the seat maps a demo is likely to open from looking untouched.
  const trips = await Trip.find().sort({ departureAt: 1 }).limit(200);
  const counts = { paid: 0, pending: 0, boarded: 0, passengers: people.length };

  for (let i = 0; i < trips.length; i += 2) {
    const trip = trips[i];
    const person = people[i % people.length];
    const seatCount = (i % 3) + 1;

    // take the next free seats on this vehicle
    const taken = new Set(trip.seats.map((s) => s.number));
    const seats = [];
    for (let row = 0; row < trip.rows && seats.length < seatCount; row++) {
      for (let col = 1; col <= trip.columns && seats.length < seatCount; col++) {
        const number = `${String.fromCharCode(65 + row)}${col}`;
        if (!taken.has(number)) seats.push(number);
      }
    }
    if (seats.length < seatCount) continue;

    const ref = reference();
    // one in five is left unpaid, and one in seven has already travelled
    const unpaid = i % 15 === 12;
    const boarded = !unpaid && i % 21 === 0;
    const bookedAt = new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000);

    trip.seats.push(
      ...seats.map((number) => ({
        number,
        status: unpaid ? "held" : "paid",
        bookingRef: ref,
        ...(unpaid ? { holdExpiresAt: new Date(Date.now() + 9 * 60 * 1000) } : {}),
      }))
    );
    await trip.save();

    await Booking.create({
      reference: ref,
      user: person._id,
      trip: trip._id,
      seats,
      passengerName: person.fullName,
      passengerPhone: person.phone,
      passengerEmail: person.email,
      amount: trip.fare * seats.length,
      status: unpaid ? "pending" : "paid",
      holdExpiresAt: new Date(Date.now() + 9 * 60 * 1000),
      createdAt: bookedAt,
      payment: unpaid
        ? { provider: "paystack" }
        : { provider: "paystack", reference: ref, channel: "card", paidAt: bookedAt },
      ticket: unpaid
        ? {}
        : { issuedAt: bookedAt, ...(boarded ? { checkedInAt: new Date(), checkedInGate: "Gate 1" } : {}) },
    });

    if (unpaid) counts.pending++;
    else counts.paid++;
    if (boarded) counts.boarded++;
  }

  return counts;
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
    User.deleteMany({ email: { $in: ["demo@example.com", "admin@example.com"] } }),
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

  // The platform owner. Change this password before deploying anywhere real.
  await User.create({
    fullName: "Platform Administrator",
    email: "admin@example.com",
    phone: "08010000000",
    passwordHash: await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin12345",
      10
    ),
    role: "admin",
  });

  const activity = await seedBookings();

  console.log(`Seeded ${upcoming.length} trips across ${ROUTES.length} routes.`);
  console.log(
    `Seeded ${activity.paid} paid, ${activity.pending} pending and ` +
      `${activity.boarded} boarded booking(s) for ${activity.passengers} passengers.`
  );
  console.log("Passenger login:  demo@example.com   /  password123");
  console.log("Admin login:      admin@example.com  /  " +
    (process.env.ADMIN_PASSWORD || "admin12345") + "   ->  /admin");

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
