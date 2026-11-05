import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getSetting, setSetting } from "./content";

const KEY = "site_lock";
export const LOCK_COOKIE = "dg_pass";

export const DEFAULT_LOCK = {
  enabled: false,
  title: "Svetainės atnaujinimo darbai",
  message: "Gerbiami lankytojai, šiuo metu vykdome planinius svetainės atnaujinimo darbus, kad ji veiktų dar sklandžiau. Atsiprašome už laikinus nepatogumus. Sugrįžkite šiek tiek vėliau. Ačiū už kantrybę!",
  eta: "",
  hash: null,
  salt: null,
  version: 0,
};

export async function getLock() {
  return { ...DEFAULT_LOCK, ...(await getSetting(KEY, {})) };
}

export async function saveLock(lock) {
  await setSetting(KEY, lock);
}

export function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(pw, salt, 32).toString("hex") };
}

export function checkLockPassword(lock, pw) {
  if (!lock.hash || !lock.salt || typeof pw !== "string" || !pw) return false;
  const a = scryptSync(pw, lock.salt, 32);
  const b = Buffer.from(lock.hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// Slapuko reikšmė pasikeičia pakeitus slaptažodį, todėl seni slapukai nebegalioja
export function passToken(lock) {
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || process.env.DATABASE_URL || "dg";
  return createHmac("sha256", secret).update(`${lock.hash}:${lock.version}`).digest("hex");
}

export async function hasPass(lock) {
  if (!lock.hash) return false;
  const got = (await cookies()).get(LOCK_COOKIE)?.value;
  const want = passToken(lock);
  return Boolean(got) && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}
