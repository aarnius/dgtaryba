import { sql } from "./db";
import { DEFAULT_BELLS } from "./bells";

export async function getSetting(key, fallback) {
  const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`;
  return row?.value ?? fallback;
}

export async function setSetting(key, value) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

export const getBells = () => getSetting("bells", DEFAULT_BELLS);

export const getCouncil = () => sql`SELECT * FROM council_members ORDER BY position, id`;
export const getDecisions = (limit = 100) => sql`SELECT * FROM decisions ORDER BY decided_on DESC, id DESC LIMIT ${limit}`;

// Nuveikti darbai + idėjos, pažymėtos „Įgyvendinta“, viena laiko juosta
export async function getTimeline(limit = 100) {
  return sql`
    SELECT * FROM (
      SELECT 'a' || id AS key, id, title, body, emoji, done_on AS day, 'achievement' AS kind FROM achievements
      UNION ALL
      SELECT 'i' || id, id, title, body, '💡', created_at::date, 'idea' FROM ideas WHERE status = 'done'
    ) t ORDER BY day DESC, key DESC LIMIT ${limit}`;
}

export const getAlbums = () => sql`
  SELECT a.*, count(p.id)::int AS photo_count,
         (SELECT url FROM photos WHERE album_id = a.id ORDER BY id LIMIT 1) AS cover
  FROM albums a LEFT JOIN photos p ON p.album_id = a.id
  GROUP BY a.id ORDER BY coalesce(a.event_date, a.created_at::date) DESC, a.id DESC`;

export async function getAlbum(id) {
  const [album] = await sql`SELECT * FROM albums WHERE id = ${id}`;
  if (!album) return null;
  const photos = await sql`SELECT * FROM photos WHERE album_id = ${id} ORDER BY id`;
  return { ...album, photos };
}

export const getVideos = (limit = 30) => sql`SELECT * FROM videos ORDER BY created_at DESC, id DESC LIMIT ${limit}`;
