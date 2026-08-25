# Lagos OTRS — Online Ticket Reservation System

A working prototype of an online ticket reservation system for the Lagos State
Transport Company, covering bus (BRT/LAGBUS), ferry (LAGFERRY) and rail
(Blue/Red Line) services.

Built with **Next.js (App Router)** and **MongoDB via Mongoose**.

## Scope

The prototype implements the four objectives from Chapter One and nothing else —
no fleet maintenance, no GPS tracking, no admin analytics.

| # | Objective | Where it lives |
|---|-----------|----------------|
| 1 | A user-friendly interface for searching routes and schedules | `components/SearchForm.js`, `lib/trips.js`, `app/trips/page.js` |
| 2 | A secure seat-selection and reservation algorithm | `lib/reservation.js`, `components/SeatPicker.js`, `app/api/bookings/route.js` |
| 3 | A local payment gateway (Paystack) for instant booking | `lib/paystack.js`, `lib/settle.js`, `app/api/payments/*` |
| 4 | Unique QR-code tickets for validation at the boarding gate | `lib/ticket.js`, `app/tickets/[reference]/page.js`, `app/verify/[reference]/page.js` |

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

- `MONGODB_URI` — your database (see the three options below)
- `JWT_SECRET` — any long random string; generate one with `openssl rand -base64 32`
- `PAYSTACK_SECRET_KEY` — optional, leave blank to use the built-in sandbox checkout

### 3. Pick a database

**MongoDB Atlas (what this project uses).** Create a free cluster at
[mongodb.com/atlas](https://www.mongodb.com/atlas) and paste the connection
string into `MONGODB_URI`. Make sure the database name in the string is
`lagos_otrs` — it is the segment between the host and the `?`:

```
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/lagos_otrs?retryWrites=true&w=majority
                                                      ^^^^^^^^^^
```

Atlas also needs your IP address allowed under **Network Access** in its
dashboard, otherwise the connection times out.

*Alternatives:* `npm run db` starts a throwaway local MongoDB that needs no
installation and keeps its data in `.mongo-data/`, or install the real thing
with `brew install mongodb-community`.

### 4. Load the demo data and run

```bash
npm run seed
npm run dev
```

Open <http://localhost:3000>. The seed creates about 300 trips over the next
seven days and one account to sign in with:

```
demo@example.com  /  password123
```

## User guide

A step-by-step manual with screenshots of every screen, covering both passengers
and boarding-gate staff, is at
[docs/Lagos-OTRS-User-Guide.pdf](docs/Lagos-OTRS-User-Guide.pdf).

To rebuild it after changing the app (retake the screenshots first, then):

```bash
node docs/build-user-guide.mjs
```

## Walkthrough

1. **Search** — pick a terminal, date and mode on the home page.
2. **Select seats** — click seats on the live seat map. Taken seats are struck out.
3. **Reserve** — the seats are held for 10 minutes while you pay.
4. **Pay** — with no Paystack key configured you land on a sandbox checkout with
   "simulate success" and "simulate failure" buttons. With a key, this is the
   real Paystack page and you can use their test cards.
5. **Ticket** — a QR ticket is issued at `/tickets/<reference>`.
6. **Board** — scan the QR with a phone camera, or open `/verify` and type the
   reference. Press *Admit passenger*. A second scan is refused.

## How the reservation algorithm works

Two passengers tapping the same seat at the same moment must not both get it.
Reading the seat map and then writing to it leaves a gap where both reads say
"free", so instead the check and the claim are a **single conditional update**
(`lib/reservation.js`):

```js
Trip.findOneAndUpdate(
  { _id: tripId, "seats.number": { $nin: seats } }, // no one holds these seats
  { $push: { seats: { $each: entries } } },         // claim them
)
```

MongoDB guarantees a single-document update is atomic, so of any number of
simultaneous requests exactly one matches; every other request gets `null` back
and is told to choose again. No transactions, no lock table, no double booking.

Seats are first `held` with a 10-minute timer. Expired holds are swept back into
the pool before each attempt, so abandoned checkouts do not block a vehicle.
They only become `paid` after the gateway confirms the money (`lib/settle.js`).

## Security notes

- Passwords are hashed with bcrypt; the hash never leaves the server.
- Sessions are signed JWTs in an `httpOnly` cookie, so JavaScript cannot read them.
- A browser redirect is never treated as proof of payment — the server always
  re-confirms the transaction with Paystack before issuing a ticket.
- Paystack webhooks are checked against an HMAC-SHA512 signature.
- Each QR code carries an HMAC signature, so tickets cannot be forged by
  guessing a reference, and a ticket can only be admitted once.

## Project layout

```
app/
  api/            REST endpoints (auth, trips, bookings, payments, tickets)
  trips/          search results and the seat-selection page
  tickets/        the passenger's bookings and the QR ticket
  verify/         boarding-gate validation
  payment/        gateway callback and the sandbox checkout
components/       client-side interactive pieces
lib/
  reservation.js  the seat reservation algorithm
  settle.js       the single place a booking becomes a ticket
  paystack.js     payment gateway integration
  ticket.js       QR generation and ticket signatures
models/           Mongoose schemas: User, Trip, Booking
scripts/          seed data and the throwaway dev database
```

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the app on port 3000 |
| `npm run db` | Start the no-install dev database |
| `npm run seed` | Wipe and reload the demo trips and account |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
