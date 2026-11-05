import { put, del } from "@vercel/blob";

const MAX = 4 * 1024 * 1024;

// Įkelia nuotrauką į Vercel Blob ir grąžina viešą adresą
export async function uploadImage(file, folder) {
  if (!file || typeof file === "string" || !file.size) return null;
  if (!file.type?.startsWith("image/")) throw new Error("Tai ne nuotrauka");
  if (file.size > MAX) throw new Error("Nuotrauka per didelė (iki 4 MB)");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await put(`${folder}/${Date.now()}.${ext}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
  return blob.url;
}

export async function deleteImages(urls) {
  const list = urls.filter((u) => typeof u === "string" && u.includes(".blob.vercel-storage.com"));
  if (!list.length) return;
  try { await del(list); } catch (err) { console.warn("[taryba] Nepavyko ištrinti nuotraukų:", err?.message); }
}
