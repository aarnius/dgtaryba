import { cookies, headers } from "next/headers";
import { signToken, readToken, rpFromHost } from "./webauthn";

export const PK_SESSION = "dg_pk";
const PK_CHALLENGE = "dg_pk_chal";
const SESSION_DAYS = 30;

const secret = () => process.env.NEON_AUTH_COOKIE_SECRET || null;
export const passkeyConfigured = () => Boolean(secret());
const secure = process.env.NODE_ENV === "production";

export async function currentRp() {
  const h = await headers();
  return { rpId: rpFromHost(h.get("x-forwarded-host") || h.get("host")), rpName: "DG mokinių taryba" };
}

/* ---------- Vienkartinis iššūkis (5 min.) ---------- */

export async function saveChallenge(purpose, challenge) {
  (await cookies()).set(PK_CHALLENGE, signToken(secret(), `chal-${purpose}`, challenge, 300), {
    httpOnly: true, sameSite: "strict", path: "/", maxAge: 300, secure,
  });
}

export async function takeChallenge(purpose) {
  const jar = await cookies();
  const v = readToken(secret(), `chal-${purpose}`, jar.get(PK_CHALLENGE)?.value);
  jar.delete(PK_CHALLENGE);
  return v;
}

/* ---------- Sesija (30 d.) ---------- */

export async function startPasskeySession(credId) {
  (await cookies()).set(PK_SESSION, signToken(secret(), "sess", credId, SESSION_DAYS * 86400), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400, secure,
  });
}

// Grąžina passkey ID iš slapuko (patikrinus parašą ir galiojimą) arba null
export async function passkeySessionId() {
  if (!secret()) return null;
  return readToken(secret(), "sess", (await cookies()).get(PK_SESSION)?.value);
}

export async function endPasskeySession() {
  (await cookies()).delete(PK_SESSION);
}
