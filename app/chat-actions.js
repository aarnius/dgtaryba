"use server";

import { sql } from "@/lib/db";
import { getVoter, ensureVoter, requirePerm } from "@/lib/session";

const clean = (v, max) => String(v ?? "").replace(/\s+$/g, "").trim().slice(0, max);
const MSG_FIELDS = (rows) => rows.map((m) => ({ id: m.id, mine: undefined, admin: m.from_admin, author: m.from_admin ? m.author : null, body: m.body, at: m.created_at }));

/* ---------- Mokinio pusė ---------- */

// Grąžina žinutes nuo `after` id (polling kas kelias sekundes)
export async function chatPoll(after = 0) {
  const voter = await getVoter();
  if (!voter) return { thread: null, messages: [] };
  const [t] = await sql`SELECT id, status, unread_user FROM chat_threads WHERE voter = ${voter}`;
  if (!t) return { thread: null, messages: [] };
  const rows = await sql`SELECT * FROM chat_messages WHERE thread_id = ${t.id} AND id > ${Number(after) || 0} ORDER BY id LIMIT 200`;
  return { thread: { id: t.id, status: t.status, unread: t.unread_user }, messages: MSG_FIELDS(rows) };
}

export async function chatMarkRead() {
  const voter = await getVoter();
  if (voter) await sql`UPDATE chat_threads SET unread_user = 0 WHERE voter = ${voter}`;
}

export async function chatDeleteMine() {
  const voter = await getVoter();
  if (voter) await sql`DELETE FROM chat_threads WHERE voter = ${voter}`;
  return { ok: true };
}

export async function chatSend(body, name) {
  const text = clean(body, 1000);
  if (!text) return { ok: false, msg: "Tuščia žinutė" };
  const voter = await ensureVoter();

  // Paprasta apsauga nuo šlamšto: ne daugiau 20 žinučių per 10 min.
  const [{ n }] = await sql`
    SELECT count(*)::int AS n FROM chat_messages m JOIN chat_threads t ON t.id = m.thread_id
    WHERE t.voter = ${voter} AND NOT m.from_admin AND m.created_at > now() - interval '10 minutes'`;
  if (n >= 20) return { ok: false, msg: "Per daug žinučių. Palauk kelias minutes 🙏" };

  const nm = clean(name, 60) || null;
  const [t] = await sql`
    INSERT INTO chat_threads (voter, name) VALUES (${voter}, ${nm})
    ON CONFLICT (voter) DO UPDATE SET name = coalesce(EXCLUDED.name, chat_threads.name), status = 'open',
      unread_admin = chat_threads.unread_admin + 1, last_at = now()
    RETURNING id, (xmax = 0) AS created`;
  if (t.created) await sql`UPDATE chat_threads SET unread_admin = 1 WHERE id = ${t.id}`;
  await sql`INSERT INTO chat_messages (thread_id, body) VALUES (${t.id}, ${text})`;
  return { ok: true };
}

/* ---------- Tarybos pusė ---------- */

export async function adminThreads() {
  await requirePerm("questions");
  // Saugojimo terminas: pokalbiai ištrinami po 12 mėn. nuo paskutinės žinutės (žr. /privatumas)
  await sql`DELETE FROM chat_threads WHERE last_at < now() - interval '12 months'`;
  return sql`
    SELECT t.id, t.name, t.status, t.unread_admin, t.last_at,
           (SELECT body FROM chat_messages WHERE thread_id = t.id ORDER BY id DESC LIMIT 1) AS last_body
    FROM chat_threads t ORDER BY (t.status = 'open') DESC, t.last_at DESC LIMIT 100`;
}

export async function adminThread(id, after = 0) {
  await requirePerm("questions");
  const tid = Number(id);
  const rows = await sql`SELECT * FROM chat_messages WHERE thread_id = ${tid} AND id > ${Number(after) || 0} ORDER BY id LIMIT 300`;
  await sql`UPDATE chat_threads SET unread_admin = 0 WHERE id = ${tid}`;
  return MSG_FIELDS(rows);
}

export async function adminReply(id, body) {
  const user = await requirePerm("questions");
  const text = clean(body, 2000);
  if (!text) return { ok: false };
  const tid = Number(id);
  const author = user.name?.split(/\s+/)[0] || "Taryba";
  await sql`INSERT INTO chat_messages (thread_id, from_admin, author, body) VALUES (${tid}, true, ${author}, ${text})`;
  await sql`UPDATE chat_threads SET unread_user = unread_user + 1, last_at = now() WHERE id = ${tid}`;
  return { ok: true };
}

export async function adminSetThreadStatus(id, status) {
  await requirePerm("questions");
  if (!["open", "closed"].includes(status)) return;
  await sql`UPDATE chat_threads SET status = ${status} WHERE id = ${Number(id)}`;
}

export async function adminDeleteThread(id) {
  await requirePerm("questions");
  await sql`DELETE FROM chat_threads WHERE id = ${Number(id)}`;
}

export async function adminUnreadCount() {
  await requirePerm("questions");
  const [{ n }] = await sql`SELECT coalesce(sum(unread_admin), 0)::int AS n FROM chat_threads WHERE status = 'open'`;
  return n;
}
