"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { after } from "next/server";
import { sql } from "@/lib/db";
import { requirePerm } from "@/lib/session";
import { uploadImage, deleteImages } from "@/lib/upload";
import { parseVideoUrl, resolveShortUrl } from "@/lib/videos";
import { parseBells } from "@/lib/bells";
import { setSetting } from "@/lib/content";
import { notifyAll, pushConfigured } from "@/lib/push";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/", "layout");
const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v ?? "")) ? String(v) : null);
const idOf = (fd) => { const n = Number(fd.get("id")); return Number.isInteger(n) && n > 0 ? n : null; };
const fail = (err) => ({ ok: false, msg: err?.message || "Kažkas nepavyko" });

/* ---------- Tarybos nariai ---------- */

export async function saveCouncilMember(_prev, fd) {
  await requirePerm("council");
  try {
    const id = idOf(fd);
    const name = clean(fd.get("name"), 80);
    if (!name) return { ok: false, msg: "Įrašyk vardą" };
    if (fd.get("consent") !== "1") return { ok: false, msg: "Pažymėk, kad narys sutiko su duomenų skelbimu" };
    const role = clean(fd.get("role"), 80) || null;
    const className = clean(fd.get("class_name"), 20) || null;
    const bio = clean(fd.get("bio"), 600) || null;
    const contact = clean(fd.get("contact"), 120) || null;
    const photo = await uploadImage(fd.get("photo"), "nariai");

    if (id) {
      const [old] = await sql`SELECT photo_url FROM council_members WHERE id = ${id}`;
      const removePhoto = fd.get("remove_photo") === "1";
      const photoUrl = photo ?? (removePhoto ? null : old?.photo_url ?? null);
      await sql`UPDATE council_members SET name = ${name}, role = ${role}, class_name = ${className}, bio = ${bio},
                contact = ${contact}, photo_url = ${photoUrl} WHERE id = ${id}`;
      if (old?.photo_url && old.photo_url !== photoUrl) after(() => deleteImages([old.photo_url]));
      refresh();
      redirect("/admin/taryba");
    }
    await sql`INSERT INTO council_members (name, role, class_name, bio, contact, photo_url, position)
              SELECT ${name}, ${role}, ${className}, ${bio}, ${contact}, ${photo}, coalesce(max(position), 0) + 1 FROM council_members`;
    refresh();
    return { ok: true, msg: "Narys pridėtas ✓", at: Date.now() };
  } catch (err) {
    unstable_rethrow(err);
    return fail(err);
  }
}

export async function moveCouncilMember(fd) {
  await requirePerm("council");
  const id = idOf(fd);
  const up = fd.get("dir") === "up";
  const list = await sql`SELECT id FROM council_members ORDER BY position, id`;
  const i = list.findIndex((m) => m.id === id);
  const j = up ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  for (const [pos, m] of list.entries()) await sql`UPDATE council_members SET position = ${pos} WHERE id = ${m.id}`;
  refresh();
}

export async function deleteCouncilMember(fd) {
  await requirePerm("council");
  const [m] = await sql`DELETE FROM council_members WHERE id = ${idOf(fd)} RETURNING photo_url`;
  if (m?.photo_url) after(() => deleteImages([m.photo_url]));
  refresh();
}

/* ---------- Sprendimai ir nuveikti darbai ---------- */

export async function saveDecision(_prev, fd) {
  await requirePerm("council");
  const title = clean(fd.get("title"), 200);
  if (!title) return { ok: false, msg: "Įrašyk sprendimą" };
  const body = clean(fd.get("body"), 2000) || null;
  const d = day(fd.get("day"));
  await sql`INSERT INTO decisions (title, body, decided_on) VALUES (${title}, ${body}, coalesce(${d}::date, CURRENT_DATE))`;
  refresh();
  return { ok: true, msg: "Sprendimas pridėtas ✓", at: Date.now() };
}

export async function deleteDecision(fd) {
  await requirePerm("council");
  await sql`DELETE FROM decisions WHERE id = ${idOf(fd)}`;
  refresh();
}

export async function saveAchievement(_prev, fd) {
  await requirePerm("council");
  const title = clean(fd.get("title"), 200);
  if (!title) return { ok: false, msg: "Įrašyk, kas nuveikta" };
  const body = clean(fd.get("body"), 1000) || null;
  const emoji = clean(fd.get("emoji"), 8) || "✅";
  const d = day(fd.get("day"));
  await sql`INSERT INTO achievements (title, body, emoji, done_on) VALUES (${title}, ${body}, ${emoji}, coalesce(${d}::date, CURRENT_DATE))`;
  refresh();
  return { ok: true, msg: "Pridėta į nuveiktus darbus ✓", at: Date.now() };
}

export async function deleteAchievement(fd) {
  await requirePerm("council");
  await sql`DELETE FROM achievements WHERE id = ${idOf(fd)}`;
  refresh();
}

/* ---------- Galerija ---------- */

export async function createAlbum(_prev, fd) {
  await requirePerm("council");
  const title = clean(fd.get("title"), 120);
  if (!title) return { ok: false, msg: "Įrašyk albumo pavadinimą" };
  const [a] = await sql`INSERT INTO albums (title, event_date) VALUES (${title}, ${day(fd.get("day"))}::date) RETURNING id`;
  refresh();
  redirect(`/admin/galerija?albumas=${a.id}`);
}

// Kviečiama iš naršyklės po vieną nuotrauką (jau sumažintą)
export async function uploadPhoto(albumId, fd) {
  await requirePerm("council");
  try {
    const [a] = await sql`SELECT id FROM albums WHERE id = ${Number(albumId)}`;
    if (!a) return { ok: false, msg: "Albumas nerastas" };
    const url = await uploadImage(fd.get("photo"), `galerija/${a.id}`);
    if (!url) return { ok: false, msg: "Tuščias failas" };
    const w = Number(fd.get("w")) || null, h = Number(fd.get("h")) || null;
    await sql`INSERT INTO photos (album_id, url, width, height) VALUES (${a.id}, ${url}, ${w}, ${h})`;
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function finishUpload() {
  await requirePerm("council");
  refresh();
}

export async function deletePhoto(fd) {
  await requirePerm("council");
  const [p] = await sql`DELETE FROM photos WHERE id = ${idOf(fd)} RETURNING url`;
  if (p?.url) after(() => deleteImages([p.url]));
  refresh();
}

export async function deleteAlbum(fd) {
  await requirePerm("council");
  const id = idOf(fd);
  const photos = await sql`SELECT url FROM photos WHERE album_id = ${id}`;
  await sql`DELETE FROM albums WHERE id = ${id}`;
  after(() => deleteImages(photos.map((p) => p.url)));
  refresh();
  redirect("/admin/galerija");
}

/* ---------- Video ---------- */

export async function addVideo(_prev, fd) {
  await requirePerm("council");
  const raw = clean(fd.get("url"), 500);
  const url = await resolveShortUrl(raw);
  const v = parseVideoUrl(url);
  if (!v) return { ok: false, msg: "Neatpažinau nuorodos. Įklijuok Instagram, TikTok arba YouTube įrašo nuorodą." };
  const title = clean(fd.get("title"), 120) || null;
  await sql`INSERT INTO videos (platform, video_id, url, title) VALUES (${v.platform}, ${v.videoId}, ${url}, ${title})`;
  refresh();
  return { ok: true, msg: "Video pridėtas ✓", at: Date.now() };
}

export async function deleteVideo(fd) {
  await requirePerm("council");
  await sql`DELETE FROM videos WHERE id = ${idOf(fd)}`;
  refresh();
}

/* ---------- Pamokų laikas ---------- */

export async function saveBells(_prev, fd) {
  await requirePerm("page");
  const { bells, error } = parseBells(fd.get("bells"));
  if (error) return { ok: false, msg: error };
  await setSetting("bells", bells);
  refresh();
  return { ok: true, msg: "Pamokų laikas išsaugotas ✓", at: Date.now() };
}

/* ---------- Pranešimai ---------- */

export async function subscribePush(sub) {
  const endpoint = String(sub?.endpoint ?? "");
  const p256dh = String(sub?.keys?.p256dh ?? ""), auth = String(sub?.keys?.auth ?? "");
  if (!/^https:\/\//.test(endpoint) || endpoint.length > 1000 || !p256dh || !auth) return { ok: false };
  await sql`INSERT INTO push_subs (endpoint, p256dh, auth) VALUES (${endpoint}, ${p256dh.slice(0, 200)}, ${auth.slice(0, 100)})
            ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`;
  return { ok: true };
}

export async function unsubscribePush(endpoint) {
  await sql`DELETE FROM push_subs WHERE endpoint = ${String(endpoint ?? "")}`;
  return { ok: true };
}

export async function sendNotification(_prev, fd) {
  await requirePerm("page");
  if (!pushConfigured()) return { ok: false, msg: "Pranešimai nesukonfigūruoti (trūksta VAPID raktų)" };
  const title = clean(fd.get("title"), 80);
  const body = clean(fd.get("body"), 200);
  const url = clean(fd.get("url"), 200);
  if (!title) return { ok: false, msg: "Įrašyk pavadinimą" };
  const { sent } = await notifyAll({ title, body, url: url.startsWith("/") ? url : "/" });
  return { ok: true, msg: `Išsiųsta ${sent} gavėjams 📣`, at: Date.now() };
}
