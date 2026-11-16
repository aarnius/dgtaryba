"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { newChallenge, verifyRegistration, verifyAssertion } from "@/lib/webauthn";
import {
  passkeyConfigured, currentRp, saveChallenge, takeChallenge, startPasskeySession, passkeySessionId, endPasskeySession,
} from "@/lib/passkey";
import { createHash } from "node:crypto";

const MAX_PER_USER = 10;
const fail = (msg) => ({ ok: false, msg });

async function verifiedUser() {
  const user = await getCurrentUser();
  if (!user?.verified) throw new Error("Prisijunk ir patvirtink el. paštą");
  return user;
}

/* ---------- Naujas passkey (prisijungusiam nariui) ---------- */

export async function passkeyRegisterOptions() {
  if (!passkeyConfigured()) return fail("Passkey nesukonfigūruotas");
  const user = await verifiedUser();
  const { rpId, rpName } = await currentRp();
  const existing = await sql`SELECT id, transports FROM passkeys WHERE email = ${user.email}`;
  if (existing.length >= MAX_PER_USER) return fail(`Daugiausia ${MAX_PER_USER} passkey vienam žmogui`);
  const challenge = newChallenge();
  await saveChallenge("reg", challenge);
  return {
    ok: true,
    options: {
      challenge,
      rp: { id: rpId, name: rpName },
      // Pastovus, bet neatskleidžiantis el. pašto ID
      user: { id: createHash("sha256").update(`dg:${user.email}`).digest("base64url"), name: user.email, displayName: user.name || user.email },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -8 }, { type: "public-key", alg: -257 }],
      timeout: 120000,
      attestation: "none",
      authenticatorSelection: { residentKey: "required", requireResidentKey: true, userVerification: "required" },
      excludeCredentials: existing.map((c) => ({ type: "public-key", id: c.id, transports: c.transports })),
    },
  };
}

export async function passkeyRegister(credential, rawName) {
  try {
    const user = await verifiedUser();
    const challenge = await takeChallenge("reg");
    if (!challenge) return fail("Pasibaigė laikas. Bandyk dar kartą");
    const { rpId } = await currentRp();
    const c = verifyRegistration(credential, { challenge, rpId });
    const name = String(rawName ?? "").trim().slice(0, 60) || "Passkey";
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM passkeys WHERE email = ${user.email}`;
    if (n >= MAX_PER_USER) return fail(`Daugiausia ${MAX_PER_USER} passkey vienam žmogui`);
    const rows = await sql`INSERT INTO passkeys (id, email, public_key, alg, counter, transports, name)
              VALUES (${c.id}, ${user.email}, ${c.publicKey}, ${c.alg}, ${c.counter}, ${c.transports}, ${name})
              ON CONFLICT (id) DO NOTHING RETURNING id`;
    if (!rows.length) return fail("Šis passkey jau pridėtas");
    revalidatePath("/admin/passkey");
    return { ok: true, msg: "Passkey pridėtas ✓ Kitą kartą prisijunk su juo." };
  } catch (err) {
    console.error("[taryba] passkey registracija:", err?.message);
    return fail(err?.message || "Nepavyko pridėti passkey");
  }
}

/* ---------- Prisijungimas ---------- */

export async function passkeyLoginOptions() {
  if (!passkeyConfigured()) return fail("Passkey nesukonfigūruotas");
  const { rpId } = await currentRp();
  const challenge = newChallenge();
  await saveChallenge("auth", challenge);
  // allowCredentials tuščias: naršyklė pati pasiūlo šios svetainės passkey (el. pašto vesti nereikia)
  return { ok: true, options: { challenge, rpId, timeout: 120000, userVerification: "required", allowCredentials: [] } };
}

export async function passkeyLogin(assertion) {
  try {
    const challenge = await takeChallenge("auth");
    if (!challenge) return fail("Pasibaigė laikas. Bandyk dar kartą");
    const id = String(assertion?.id ?? "");
    const [stored] = id ? await sql`SELECT * FROM passkeys WHERE id = ${id}` : [];
    if (!stored) return fail("Šis passkey nebegalioja. Prisijunk kitu būdu ir sukurk naują.");
    const { rpId } = await currentRp();
    const { newCounter } = verifyAssertion(assertion, stored, { challenge, rpId });
    await sql`UPDATE passkeys SET counter = ${newCounter}, last_used_at = now() WHERE id = ${stored.id}`;
    await startPasskeySession(stored.id);
    return { ok: true };
  } catch (err) {
    console.error("[taryba] passkey prisijungimas:", err?.message);
    return fail(err?.message || "Nepavyko prisijungti");
  }
}

/* ---------- Ištrinti savo passkey ---------- */

export async function deletePasskey(fd) {
  const user = await verifiedUser();
  const id = String(fd.get("id") ?? "");
  await sql`DELETE FROM passkeys WHERE id = ${id} AND email = ${user.email}`;
  if ((await passkeySessionId()) === id) await endPasskeySession();
  revalidatePath("/admin/passkey");
}
