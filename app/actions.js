"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { ensureVoter, isAdmin, checkPassword, setAdminCookie, clearAdminCookie } from "@/lib/session";

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
