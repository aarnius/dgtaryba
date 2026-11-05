"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePerm } from "@/lib/session";
import { getLock, saveLock, hashPassword, checkLockPassword, passToken, LOCK_COOKIE } from "@/lib/lock";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function unlockSite(_prev, fd) {
  const lock = await getLock();
  if (!lock.enabled) redirect("/");
  const ok = checkLockPassword(lock, String(fd.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 700)); // lėtinam spėliojimą
    return { ok: false, msg: "Neteisingas slaptažodis" };
  }
  (await cookies()).set(LOCK_COOKIE, passToken(lock), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

export async function saveLockSettings(_prev, fd) {
  await requirePerm("page");
  const lock = await getLock();
  const enabled = fd.get("enabled") === "1";
  const pw = String(fd.get("password") ?? "");
  const next = {
    ...lock,
    enabled,
    title: clean(fd.get("title"), 120) || lock.title,
    message: clean(fd.get("message"), 1500) || lock.message,
    eta: clean(fd.get("eta"), 120),
  };
  if (fd.get("remove_password") === "1") {
    next.hash = null; next.salt = null; next.version = (lock.version || 0) + 1;
  } else if (pw) {
    if (pw.length < 4) return { ok: false, msg: "Slaptažodis per trumpas (bent 4 simboliai)" };
    Object.assign(next, hashPassword(pw), { version: (lock.version || 0) + 1 });
  }
  await saveLock(next);
  revalidatePath("/", "layout");
  return {
    ok: true,
    msg: enabled ? `Svetainė užrakinta 🔒${next.hash ? " · slaptažodis nustatytas" : " · be slaptažodžio (mato tik taryba)"}` : "Svetainė atrakinta 🔓",
    at: Date.now(),
  };
}
