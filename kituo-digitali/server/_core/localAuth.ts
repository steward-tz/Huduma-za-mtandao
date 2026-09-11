import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";

const scrypt = promisify(nodeScrypt);
const LOCAL_COOKIE = "huduma_local_session";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) throw new Error("JWT_SECRET is required in production");
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-me");

export function localCookieName() { return LOCAL_COOKIE; }

export function normalizePhone(phone: string) {
  const compact = phone.replace(/[\s()-]/g, "");
  const validPrefixes = ["061", "062", "063", "067", "068", "069", "070", "071", "073", "075", "077", "078", "079"];
  if (/^0\d{9}$/.test(compact) && validPrefixes.some((prefix) => compact.startsWith(prefix))) return `255${compact.slice(1)}`;
  if (/^255\d{9}$/.test(compact) && validPrefixes.some((prefix) => compact.startsWith(`255${prefix.slice(1)}`))) return compact;
  throw new Error("Namba ya simu si sahihi. Tumia mfano 07XXXXXXXX.");
}

export function validatePin(pin: string) {
  return /^\d{6}$/.test(pin);
}

export async function hashPin(pin: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(pin, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPin(pin: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const derived = (await scrypt(pin, Buffer.from(saltHex, "hex"), 64)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function hashLookup(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function signLocalSession(userId: number) {
  return new SignJWT({ type: "local", userId: String(userId) }).setProtectedHeader({ alg: "HS256" }).setSubject(String(userId)).setIssuedAt().setExpirationTime("30d").sign(secret);
}

export async function verifyLocalSession(token: string) {
  try {
    const result = await jwtVerify(token, secret);
    const userId = Number(result.payload.userId ?? result.payload.sub);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) { loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 }); return true; }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}

export function localSessionCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };
}
