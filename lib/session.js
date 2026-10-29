import { cache } from "react";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { getAuth, authConfigured } from "./auth/server";
import { OWNER_EMAIL, ALL_PERMS } from "./perms";

const YEAR = 60 * 60 * 24 * 365;

/* ---------- Anoniminis balsuotojas ---------- */

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

/* ---------- Prisijungęs vartotojas ir teisės ---------- */

// { id, email, name, image, isOwner, verified, perms: string[] } arba null
export const getCurrentUser = cache(async () => {
  if (!authConfigured()) return null;
  let session;
  try {
    ({ data: session } = await getAuth().getSession());
  } catch (err) {
    console.error("[taryba] Nepavyko gauti sesijos:", err?.message);
    return null;
  }
  const u = session?.user;
  if (!u?.email) return null;

  const email = u.email.trim().toLowerCase();
  const isOwner = email === OWNER_EMAIL;
  let perms = [];
  if (isOwner) {
    perms = ALL_PERMS;
  } else {
    const [m] = await sql`SELECT perms FROM members WHERE email = ${email}`;
    perms = (m?.perms ?? []).filter((p) => ALL_PERMS.includes(p));
  }

  // Teisės galioja tik patvirtinus el. paštą, kad niekas negalėtų užsiregistruoti svetimu adresu
  const verified = Boolean(u.emailVerified);
  return { id: u.id, email, name: u.name || email, image: u.image, isOwner, verified, perms: verified ? perms : [], pendingPerms: perms };
});

export const can = (user, perm) => Boolean(user?.perms?.includes(perm));

export async function requirePerm(perm) {
  const user = await getCurrentUser();
  if (!can(user, perm)) throw new Error("Neturi teisės");
  return user;
}
