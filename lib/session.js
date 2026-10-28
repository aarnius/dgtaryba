import { cookies } from "next/headers";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

const YEAR = 60 * 60 * 24 * 365;

// Anoniminis naršyklės ID, kad vienas žmogus balsuotų vieną kartą
export async function getVoter() {
  return (await cookies()).get("voter")?.value ?? null;
}

// Kviesti tik iš server action (ten galima rašyti cookies)
export async function ensureVoter() {
  const jar = await cookies();
  let id = jar.get("voter")?.value;
  if (!id) {
    id = randomUUID();
    jar.set("voter", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR, secure: process.env.NODE_ENV === "production" });
  }
  return id;
}

function adminToken() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(`taryba:${pw}`).digest("hex");
}

export async function isAdmin() {
  const expected = adminToken();
  const got = (await cookies()).get("admin")?.value;
  if (!expected || !got || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export function checkPassword(input) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || typeof input !== "string" || input.length !== pw.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(pw));
}

export async function setAdminCookie() {
  (await cookies()).set("admin", adminToken(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production" });
}

export async function clearAdminCookie() {
  (await cookies()).delete("admin");
}
