import mongoose from "mongoose";

// Every model is registered here rather than in the pages that use them.
// populate() looks models up by name, so a page that loads Booking before Trip
// would otherwise fail with MissingSchemaError depending on import order.
import "@/models/User";
import "@/models/Trip";
import "@/models/Booking";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every reload. The connection is cached on globalThis so a
 * single pool is shared across reloads and across all API routes.
 */
let cached = globalThis._mongoose;
if (!cached) cached = globalThis._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your connection string."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
