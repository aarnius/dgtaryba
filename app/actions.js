"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ensureVoter, isAdmin, checkPassword, setAdminCookie, clearAdminCookie } from "@/lib/session";
import { KINDS, PLACES, COLORS, cleanUrl } from "@/lib/blocks";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/", "layout");

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Neprisijungta");
}

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

export async function login(_prev, formData) {
  if (!process.env.ADMIN_PASSWORD) return { ok: false, msg: "Serveryje nenustatytas ADMIN_PASSWORD" };
  if (!checkPassword(String(formData.get("password") ?? ""))) return { ok: false, msg: "Neteisingas slaptažodis" };
  await setAdminCookie();
  redirect("/admin");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin");
}

export async function setIdeaStatus(formData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["pending", "approved", "done"].includes(status)) return;
  await sql`UPDATE ideas SET status = ${status} WHERE id = ${id}`;
  refresh();
}

export async function deleteIdea(formData) {
  await requireAdmin();
  await sql`DELETE FROM ideas WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function createPoll(formData) {
  await requireAdmin();
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
  await requireAdmin();
  await sql`UPDATE polls SET active = NOT active WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deletePoll(formData) {
  await requireAdmin();
  await sql`DELETE FROM polls WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function createEvent(formData) {
  await requireAdmin();
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
  await requireAdmin();
  await sql`DELETE FROM events WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function answerQuestion(formData) {
  await requireAdmin();
  const answer = clean(formData.get("answer"), 1500);
  if (!answer) return;
  await sql`UPDATE questions SET answer = ${answer}, answered_at = now() WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deleteQuestion(formData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  await sql`UPDATE blocks SET visible = NOT visible WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}

export async function deleteBlock(formData) {
  await requireAdmin();
  await sql`DELETE FROM blocks WHERE id = ${Number(formData.get("id"))}`;
  refresh();
}
