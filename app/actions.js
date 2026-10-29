"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ensureVoter, getCurrentUser, requirePerm } from "@/lib/session";
import { getAuth } from "@/lib/auth/server";
import { PERMS, OWNER_EMAIL } from "@/lib/perms";
import { KINDS, PLACES, COLORS, cleanUrl } from "@/lib/blocks";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/", "layout");



/* ---------- Mokiniams ---------- */

export async function submitIdea(_prev, formData) {
  const title = clean(formData.get("title"), 120);
  const body = clean(formData.get("body"), 1000);
  const author = clean(formData.get("author"), 60) || null;
  if (title.length < 3) return { ok: false, msg: "Parašyk bent trumpą pavadinimą 🙂" };
  await sql`INSERT INTO ideas (title, body, author) VALUES (${title}, ${body}, ${author})`;
  return { ok: true, msg: "Ačiū! Idėja pasirodys, kai taryba ją peržiūrės ✨" };
}

export async function toggleIdeaVote(formData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  const voter = await ensureVoter();
  const removed = await sql`DELETE FROM idea_votes WHERE idea_id = ${id} AND voter = ${voter} RETURNING idea_id`;
  if (removed.length === 0) {
    await sql`INSERT INTO idea_votes (idea_id, voter)
              SELECT ${id}, ${voter} WHERE EXISTS (SELECT 1 FROM ideas WHERE id = ${id} AND status <> 'pending')
              ON CONFLICT DO NOTHING`;
  }
  refresh();
}

export async function votePoll(formData) {
  const pollId = Number(formData.get("poll"));
  const optionId = Number(formData.get("option"));
  if (!Number.isInteger(pollId) || !Number.isInteger(optionId)) return;
  const voter = await ensureVoter();
  await sql`INSERT INTO poll_votes (poll_id, option_id, voter)
            SELECT ${pollId}, ${optionId}, ${voter}
            WHERE EXISTS (SELECT 1 FROM poll_options o JOIN polls p ON p.id = o.poll_id
                          WHERE o.id = ${optionId} AND p.id = ${pollId} AND p.active)
            ON CONFLICT DO NOTHING`;
  refresh();
}

export async function askQuestion(_prev, formData) {
  const body = clean(formData.get("body"), 600);
  if (body.length < 5) return { ok: false, msg: "Klausimas per trumpas 🤔" };
  await sql`INSERT INTO questions (body) VALUES (${body})`;
  return { ok: true, msg: "Klausimas išsiųstas anonimiškai! Atsakymą rasi šiame puslapyje 📬" };
}

/* ---------- Admin ---------- */

export async function setIdeaStatus(formData) {
  await requirePerm("ideas");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["pending", "approved", "done"].includes(status)) return;
  await sql`UPDATE ideas SET status = ${status} WHERE id = ${id}`;
  refresh();
}

export async function deleteIdea(formData) {
  await requirePerm("ideas");
  await sql`DELETE FROM ideas WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function createPoll(formData) {
  await requirePerm("polls");
  const question = clean(formData.get("question"), 200);
  const options = String(formData.get("options") ?? "")
    .split("\n").map((s) => s.trim().slice(0, 100)).filter(Boolean).slice(0, 8);
  if (!question || options.length < 2) return;
  const [poll] = await sql`INSERT INTO polls (question) VALUES (${question}) RETURNING id`;
  for (const label of options) {
    await sql`INSERT INTO poll_options (poll_id, label) VALUES (${poll.id}, ${label})`;
  }
  refresh();
}

export async function togglePoll(formData) {
  await requirePerm("polls");
  await sql`UPDATE polls SET active = NOT active WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deletePoll(formData) {
  await requirePerm("polls");
  await sql`DELETE FROM polls WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function createEvent(formData) {
  await requirePerm("events");
  const title = clean(formData.get("title"), 120);
  const description = clean(formData.get("description"), 600);
  const location = clean(formData.get("location"), 80);
  const emoji = clean(formData.get("emoji"), 8) || "🎉";
  const startsAt = String(formData.get("starts_at") ?? ""); // "2026-12-20T18:00"
  if (!title || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startsAt)) return;
  await sql`INSERT INTO events (title, description, location, emoji, starts_at)
            VALUES (${title}, ${description}, ${location}, ${emoji},
                    (${startsAt}::timestamp AT TIME ZONE 'Europe/Vilnius'))`;
  refresh();
}

export async function deleteEvent(formData) {
  await requirePerm("events");
  await sql`DELETE FROM events WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function answerQuestion(formData) {
  await requirePerm("questions");
  const answer = clean(formData.get("answer"), 1500);
  if (!answer) return;
  await sql`UPDATE questions SET answer = ${answer}, answered_at = now() WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deleteQuestion(formData) {
  await requirePerm("questions");
  await sql`DELETE FROM questions WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

/* ---------- Puslapio redaktorius ---------- */


function readBlock(formData) {
  const kind = String(formData.get("kind") ?? "");
  const def = KINDS[kind];
  if (!def) return { error: "Pasirink bloko tipą" };
  const place = PLACES[formData.get("place")] ? String(formData.get("place")) : "bottom";
  const color = COLORS[formData.get("color")] ? String(formData.get("color")) : "mustard";
  const has = (f) => def.fields.includes(f);
  const title = has("title") ? clean(formData.get("title"), 200) : "";
  const body = has("body") ? clean(formData.get("body"), 4000) : "";
  const url = has("url") ? cleanUrl(formData.get("url")) : "";

  if (url === null) return { error: "Nuoroda turi prasidėti https:// arba / (pvz. /renginiai)" };
  if (kind === "button" && (!title || !url)) return { error: "Mygtukui reikia teksto ir nuorodos" };
  if ((kind === "banner" || kind === "heading") && !title) return { error: "Įrašyk tekstą" };
  if (kind === "text" && !body) return { error: "Įrašyk tekstą" };
  if (kind === "image" && !url) return { error: "Įklijuok nuotraukos adresą" };

  return { kind, place, color, title: title || null, body: body || null, url: url || null };
}

export async function saveBlock(_prev, formData) {
  await requirePerm("page");
  const b = readBlock(formData);
  if (b.error) return { ok: false, msg: b.error };
  const id = Number(formData.get("id"));

  if (Number.isInteger(id) && id > 0) {
    await sql`UPDATE blocks SET kind = ${b.kind}, title = ${b.title}, body = ${b.body}, url = ${b.url}, color = ${b.color},
              position = CASE WHEN place = ${b.place} THEN position
                              ELSE (SELECT coalesce(max(position), 0) + 1 FROM blocks WHERE place = ${b.place}) END,
              place = ${b.place}
              WHERE id = ${id}`;
    refresh();
    redirect("/admin/puslapis");
  }

  await sql`INSERT INTO blocks (kind, place, title, body, url, color, position)
            SELECT ${b.kind}, ${b.place}, ${b.title}, ${b.body}, ${b.url}, ${b.color},
                   coalesce(max(position), 0) + 1 FROM blocks WHERE place = ${b.place}`;
  refresh();
  return { ok: true, msg: "Pridėta! ✨", at: Date.now() };
}

export async function moveBlock(formData) {
  await requirePerm("page");
  const id = Number(formData.get("id"));
  const dir = formData.get("dir") === "up" ? "up" : "down";
  const [me] = await sql`SELECT id, place, position FROM blocks WHERE id = ${id}`;
  if (!me) return;
  const [other] = dir === "up"
    ? await sql`SELECT id, position FROM blocks WHERE place = ${me.place} AND (position, id) < (${me.position}, ${me.id}) ORDER BY position DESC, id DESC LIMIT 1`
    : await sql`SELECT id, position FROM blocks WHERE place = ${me.place} AND (position, id) > (${me.position}, ${me.id}) ORDER BY position, id LIMIT 1`;
  if (!other) return;
  // Jei pozicijos sutampa, sukuriam skirtumą, kad sukeitimas tikrai pakeistų tvarką
  const a = other.position === me.position ? (dir === "up" ? me.position - 1 : me.position + 1) : other.position;
  await sql`UPDATE blocks SET position = CASE WHEN id = ${me.id} THEN ${a} ELSE ${me.position} END
            WHERE id IN (${me.id}, ${other.id})`;
  refresh();
}

export async function toggleBlock(formData) {
  await requirePerm("page");
  await sql`UPDATE blocks SET visible = NOT visible WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deleteBlock(formData) {
  await requirePerm("page");
  await sql`DELETE FROM blocks WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

/* ---------- Prisijungimas (Neon Auth) ---------- */

const AUTH_ERRORS = {
  INVALID_EMAIL_OR_PASSWORD: "Neteisingas el. paštas arba slaptažodis",
  USER_ALREADY_EXISTS: "Toks el. paštas jau užregistruotas. Prisijunk.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Toks el. paštas jau užregistruotas. Prisijunk.",
  PASSWORD_TOO_SHORT: "Slaptažodis per trumpas (bent 8 simboliai)",
  INVALID_EMAIL: "Neteisingas el. pašto adresas",
  INVALID_OTP: "Neteisingas kodas",
  OTP_EXPIRED: "Kodas nebegalioja. Paprašyk naujo.",
  TOO_MANY_ATTEMPTS: "Per daug bandymų. Pabandyk po kelių minučių.",
};

function authError(error, fallback) {
  if (!error) return null;
  if (String(error.code ?? "").startsWith("NETWORK_")) return "Nepavyko pasiekti prisijungimo serverio. Bandyk vėliau.";
  console.warn("[taryba] auth:", error.code, error.message);
  return AUTH_ERRORS[error.code] || fallback;
}

const readEmail = (fd) => String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);

async function sendVerificationCode(email) {
  const { error } = await getAuth().emailOtp.sendVerificationOtp({ email, type: "email-verification" });
  return authError(error, "Nepavyko išsiųsti kodo");
}

export async function signInEmail(_prev, formData) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, msg: "Įrašyk el. paštą ir slaptažodį" };
  const { error } = await getAuth().signIn.email({ email, password });
  const msg = authError(error, "Nepavyko prisijungti");
  if (msg) return { ok: false, msg };
  redirect("/admin");
}

export async function signUpEmail(_prev, formData) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const name = clean(formData.get("name"), 80) || email.split("@")[0];
  if (!email.includes("@")) return { ok: false, msg: "Neteisingas el. pašto adresas" };
  if (password.length < 8) return { ok: false, msg: "Slaptažodis per trumpas (bent 8 simboliai)" };
  const { error } = await getAuth().signUp.email({ email, password, name });
  const msg = authError(error, "Nepavyko užsiregistruoti");
  if (msg) return { ok: false, msg };
  // Užsiregistravus: jei dar neprisijungė automatiškai, prijungiam
  if (!(await getCurrentUser())) await getAuth().signIn.email({ email, password });
  await sendVerificationCode(email);
  redirect("/admin");
}

export async function resendCode() {
  const user = await getCurrentUser();
  if (!user || user.verified) return { ok: false, msg: "" };
  const msg = await sendVerificationCode(user.email);
  return msg ? { ok: false, msg } : { ok: true, msg: `Kodas išsiųstas į ${user.email} ✉️` };
}

export async function verifyCode(_prev, formData) {
  const user = await getCurrentUser();
  if (!user) redirect("/prisijungti");
  const otp = String(formData.get("otp") ?? "").replace(/\s/g, "");
  if (!/^\d{4,8}$/.test(otp)) return { ok: false, msg: "Įrašyk kodą iš laiško" };
  const { error } = await getAuth().emailOtp.verifyEmail({ email: user.email, otp });
  const msg = authError(error, "Neteisingas kodas");
  if (msg) return { ok: false, msg };
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOut() {
  try { await getAuth().signOut(); } catch {}
  redirect("/");
}

/* ---------- Vartotojai ir teisės ---------- */

function readPerms(formData, actor) {
  return formData.getAll("perm").map(String)
    .filter((p) => PERMS[p])
    // Teisę valdyti vartotojus gali duoti tik savininkas
    .filter((p) => p !== "members" || actor.isOwner);
}

export async function saveMember(_prev, formData) {
  const actor = await requirePerm("members");
  const email = readEmail(formData);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, msg: "Neteisingas el. pašto adresas" };
  if (email === OWNER_EMAIL) return { ok: false, msg: "Pagrindinė paskyra visada turi visas teises" };
  const name = clean(formData.get("name"), 80) || null;
  let perms = readPerms(formData, actor);
  if (!actor.isOwner) {
    // ne savininkas negali atimti „members“ teisės iš kito
    const [old] = await sql`SELECT perms FROM members WHERE email = ${email}`;
    if (old?.perms?.includes("members")) perms = [...new Set([...perms, "members"])];
  }
  await sql`INSERT INTO members (email, name, perms, added_by) VALUES (${email}, ${name}, ${perms}, ${actor.email})
            ON CONFLICT (email) DO UPDATE SET perms = EXCLUDED.perms, name = coalesce(EXCLUDED.name, members.name)`;
  refresh();
  return { ok: true, msg: "Išsaugota ✓", at: Date.now() };
}

export async function removeMember(formData) {
  const actor = await requirePerm("members");
  const email = readEmail(formData);
  if (email === OWNER_EMAIL) return;
  if (!actor.isOwner) {
    const [m] = await sql`SELECT perms FROM members WHERE email = ${email}`;
    if (m?.perms?.includes("members")) return;
  }
  await sql`DELETE FROM members WHERE email = ${email}`;
  refresh();
}
