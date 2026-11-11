"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import { requirePerm } from "@/lib/session";
import { getTv, saveTv } from "@/lib/tv";
import { uploadImage, deleteImages } from "@/lib/upload";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const refresh = () => { revalidatePath("/tv"); revalidatePath("/admin/tv"); };

export async function saveTvSettings(_prev, fd) {
  await requirePerm("tv");
  try {
    const tv = await getTv();
    const bg = await uploadImage(fd.get("photo"), "tv");
    const removeBg = fd.get("remove_photo") === "1";
    const old = tv.background_url;
    const next = {
      ...tv,
      headline: clean(fd.get("headline"), 80) || tv.headline,
      cta: clean(fd.get("cta"), 140) || tv.cta,
      url_text: clean(fd.get("url_text"), 60) || tv.url_text,
      ticker: String(fd.get("ticker") ?? "").split("\n").map((l) => l.trim().slice(0, 160)).filter(Boolean).slice(0, 12),
      slide_seconds: Math.min(60, Math.max(5, Number(fd.get("slide_seconds")) || 12)),
      show: { events: fd.get("show_events") === "1", ideas: fd.get("show_ideas") === "1", poll: fd.get("show_poll") === "1", photos: fd.get("show_photos") === "1" },
      background_url: bg ?? (removeBg ? null : old),
    };
    await saveTv(next);
    if (old && old !== next.background_url) after(() => deleteImages([old]));
    refresh();
    return { ok: true, msg: "Išsaugota. TV ekranas atsinaujins per kelias minutes ✓", at: Date.now() };
  } catch (err) {
    return { ok: false, msg: err?.message || "Nepavyko išsaugoti" };
  }
}

export async function addTvSlide(_prev, fd) {
  await requirePerm("tv");
  try {
    const title = clean(fd.get("title"), 80);
    const text = clean(fd.get("text"), 280);
    const image = await uploadImage(fd.get("photo"), "tv");
    if (!title && !image) return { ok: false, msg: "Įrašyk pavadinimą arba įkelk nuotrauką" };
    const tv = await getTv();
    tv.slides = [...tv.slides, { id: randomUUID(), title, text, image_url: image }].slice(0, 20);
    await saveTv(tv);
    refresh();
    return { ok: true, msg: "Skaidrė pridėta ✓", at: Date.now() };
  } catch (err) {
    return { ok: false, msg: err?.message || "Nepavyko pridėti" };
  }
}

export async function deleteTvSlide(fd) {
  await requirePerm("tv");
  const id = String(fd.get("id"));
  const tv = await getTv();
  const gone = tv.slides.find((s) => s.id === id);
  tv.slides = tv.slides.filter((s) => s.id !== id);
  await saveTv(tv);
  if (gone?.image_url) after(() => deleteImages([gone.image_url]));
  refresh();
}

export async function moveTvSlide(fd) {
  await requirePerm("tv");
  const id = String(fd.get("id"));
  const up = fd.get("dir") === "up";
  const tv = await getTv();
  const i = tv.slides.findIndex((s) => s.id === id);
  const j = up ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= tv.slides.length) return;
  [tv.slides[i], tv.slides[j]] = [tv.slides[j], tv.slides[i]];
  await saveTv(tv);
  refresh();
}
