// Instagram / TikTok / YouTube nuorodos → { platform, videoId } arba null

export function parseVideoUrl(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const parts = u.pathname.split("/").filter(Boolean);

  if (host === "instagram.com") {
    const i = parts.findIndex((p) => ["p", "reel", "reels", "tv"].includes(p));
    if (i >= 0 && parts[i + 1]) return { platform: "instagram", videoId: parts[i + 1] };
  }
  if (host === "tiktok.com") {
    const i = parts.indexOf("video");
    if (i >= 0 && /^\d+$/.test(parts[i + 1] ?? "")) return { platform: "tiktok", videoId: parts[i + 1] };
  }
  if (host === "youtube.com") {
    if (parts[0] === "shorts" && parts[1]) return { platform: "youtube", videoId: parts[1] };
    if (u.searchParams.get("v")) return { platform: "youtube", videoId: u.searchParams.get("v") };
  }
  if (host === "youtu.be" && parts[0]) return { platform: "youtube", videoId: parts[0] };
  return null;
}

// Trumpos nuorodos (vm.tiktok.com, instagr.am…) → tikras adresas
export async function resolveShortUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    if (!/^(vm|vt)\.tiktok\.com$|^instagr\.am$/.test(u.hostname)) return raw;
    const res = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (dgtaryba)" } });
    return res.url || raw;
  } catch {
    return raw;
  }
}

export function embedUrl({ platform, video_id }) {
  const id = encodeURIComponent(video_id);
  if (platform === "instagram") return `https://www.instagram.com/p/${id}/embed`;
  if (platform === "tiktok") return `https://www.tiktok.com/embed/v2/${id}`;
  if (platform === "youtube") return `https://www.youtube-nocookie.com/embed/${id}`;
  return null;
}

export const PLATFORM_LABEL = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
