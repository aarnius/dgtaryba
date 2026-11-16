// Minimalus WebAuthn (passkey) serveris be papildomų bibliotekų.
// Registracija: naršyklė pati paduoda viešąjį raktą (response.getPublicKey(), SPKI DER),
// todėl CBOR/COSE neparsinam. Prisijungimas: tikrinam parašą su išsaugotu raktu.
import { createHash, createHmac, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";

export const b64url = (buf) => Buffer.from(buf).toString("base64url");
export const fromB64url = (s) => Buffer.from(String(s ?? ""), "base64url");
const sha256 = (data) => createHash("sha256").update(data).digest();

export const newChallenge = () => b64url(randomBytes(32));

/* ---------- Pasirašyti žetonai (iššūkis ir sesija slapuke) ---------- */

function mac(secret, payload) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

// "duomenys.galiojaIki.parašas"; duomenys be taškų (base64url)
export function signToken(secret, purpose, data, ttlSec) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const body = `${data}.${exp}`;
  return `${body}.${mac(secret, `${purpose}:${body}`)}`;
}

export function readToken(secret, purpose, token) {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 3) return null;
  const [data, exp, sig] = parts;
  const want = Buffer.from(mac(secret, `${purpose}:${data}.${exp}`));
  const got = Buffer.from(sig);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  if (!(Number(exp) > Date.now() / 1000)) return null;
  return data;
}

/* ---------- RP (svetainė) ---------- */

// www.dgtaryba.lt ir dgtaryba.lt dalijasi tais pačiais passkey
export function rpFromHost(host) {
  const h = String(host ?? "").split(":")[0].toLowerCase();
  if (h === "dgtaryba.lt" || h.endsWith(".dgtaryba.lt")) return "dgtaryba.lt";
  return h;
}

function originOk(origin, rpId) {
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:" && u.hostname !== "localhost") return false;
    return u.hostname === rpId || u.hostname.endsWith("." + rpId);
  } catch {
    return false;
  }
}

/* ---------- Bendri patikrinimai ---------- */

function checkClientData(clientDataB64, type, challenge, rpId) {
  const raw = fromB64url(clientDataB64);
  let cd;
  try { cd = JSON.parse(raw.toString("utf8")); } catch { throw new Error("Blogi naršyklės duomenys"); }
  if (cd.type !== type) throw new Error("Netinkamas užklausos tipas");
  if (cd.challenge !== challenge) throw new Error("Pasibaigė laikas. Bandyk dar kartą");
  if (!originOk(cd.origin, rpId)) throw new Error("Netinkama svetainė");
  return raw;
}

function parseAuthData(authData, rpId) {
  if (authData.length < 37) throw new Error("Blogi autentifikatoriaus duomenys");
  if (!authData.subarray(0, 32).equals(sha256(rpId))) throw new Error("Passkey skirtas kitai svetainei");
  const flags = authData[32];
  if (!(flags & 0x01)) throw new Error("Nepatvirtinta (reikia paliesti / pažiūrėti)");
  // Reikalaujam biometrijos arba įrenginio PIN, ne vien prisilietimo
  if (!(flags & 0x04)) throw new Error("Reikia patvirtinti biometrija arba įrenginio PIN");
  return { flags, uv: Boolean(flags & 0x04), signCount: authData.readUInt32BE(33) };
}

/* ---------- Registracija ---------- */

// cred = { id, rawId, clientDataJSON, authenticatorData, publicKey (SPKI DER b64url), publicKeyAlgorithm, transports }
export function verifyRegistration(cred, { challenge, rpId }) {
  checkClientData(cred?.clientDataJSON, "webauthn.create", challenge, rpId);
  const authData = fromB64url(cred.authenticatorData);
  const { signCount } = parseAuthData(authData, rpId);
  if (!(authData[32] & 0x40)) throw new Error("Trūksta passkey duomenų");

  const id = String(cred.rawId || cred.id || "");
  if (!/^[A-Za-z0-9_-]{16,1400}$/.test(id)) throw new Error("Blogas passkey ID");
  // Credential ID taip pat yra authData viduje: patikrinam, kad sutampa
  const idLen = authData.readUInt16BE(53);
  if (!authData.subarray(55, 55 + idLen).equals(fromB64url(id))) throw new Error("Passkey ID nesutampa");

  const alg = Number(cred.publicKeyAlgorithm);
  if (![-7, -257, -8].includes(alg)) throw new Error("Nepalaikomas passkey tipas");
  const spki = fromB64url(cred.publicKey);
  if (!spki.length) throw new Error("Naršyklė per sena passkey. Atnaujink ją.");
  createPublicKey({ key: spki, format: "der", type: "spki" }); // meta klaidą, jei raktas blogas

  const transports = Array.isArray(cred.transports) ? cred.transports.map(String).filter((t) => /^[a-z-]{2,20}$/.test(t)).slice(0, 6) : [];
  return { id, publicKey: b64url(spki), alg, counter: signCount, transports };
}

/* ---------- Prisijungimas ---------- */

// assertion = { id, clientDataJSON, authenticatorData, signature }, stored = { public_key, alg, counter }
export function verifyAssertion(assertion, stored, { challenge, rpId }) {
  const clientData = checkClientData(assertion?.clientDataJSON, "webauthn.get", challenge, rpId);
  const authData = fromB64url(assertion.authenticatorData);
  const { signCount } = parseAuthData(authData, rpId);

  const key = createPublicKey({ key: fromB64url(stored.public_key), format: "der", type: "spki" });
  const data = Buffer.concat([authData, sha256(clientData)]);
  const sig = fromB64url(assertion.signature);
  const algo = Number(stored.alg) === -8 ? null : "sha256";
  if (!verify(algo, data, key, sig)) throw new Error("Netinkamas parašas");

  // Skaitiklis turi didėti (jei autentifikatorius jį naudoja), kitaip gali būti kopija
  const old = Number(stored.counter) || 0;
  if ((signCount > 0 || old > 0) && signCount <= old) throw new Error("Passkey skaitiklio klaida. Ištrink ir sukurk passkey iš naujo.");
  return { newCounter: signCount };
}
