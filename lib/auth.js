import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

const COOKIE = "lstc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set. See .env.example.");
  return new TextEncoder().encode(value);
}

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/** Issue the session cookie after a successful register/login. */
export async function createSession(userId) {
  const token = await new SignJWT({ sub: userId.toString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal it
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** The signed-in user, or null. Used by both pages and API routes. */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    await connectDB();
    const user = await User.findById(payload.sub);
    return user ?? null;
  } catch {
    return null; // expired or tampered token
  }
}

/** Guard for API routes that must not run for anonymous callers. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("You need to sign in to continue.");
    error.status = 401;
    throw error;
  }
  return user;
}
