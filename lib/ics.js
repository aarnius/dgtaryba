import { SITE_URL, SITE_NAME } from "./site";

const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);
const stamp = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const end = (e) => new Date(new Date(e.starts_at).getTime() + 2 * 3600 * 1000);

function vevent(e) {
  return [
    "BEGIN:VEVENT",
    `UID:renginys-${e.id}@${new URL(SITE_URL).host}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(e.starts_at)}`,
    `DTEND:${stamp(end(e))}`,
    `SUMMARY:${esc(`${e.emoji ?? ""} ${e.title}`.trim())}`,
    e.description && `DESCRIPTION:${esc(e.description)}`,
    e.location && `LOCATION:${esc(e.location)}`,
    `URL:${SITE_URL}/renginiai`,
    "END:VEVENT",
  ].filter(Boolean);
}

export function icsCalendar(events) {
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//dgtaryba//LT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(SITE_NAME)}`, "X-WR-TIMEZONE:Europe/Vilnius",
    ...events.flatMap(vevent), "END:VCALENDAR",
  ];
  // Eilutės ne ilgesnės nei 75 baitai (RFC 5545)
  return lines.flatMap((l) => {
    const out = [];
    let cur = "";
    for (const ch of l) {
      if (Buffer.byteLength(cur + ch) > 74) { out.push(cur); cur = " " + ch; } else cur += ch;
    }
    out.push(cur);
    return out;
  }).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.emoji ?? ""} ${e.title}`.trim(),
    dates: `${stamp(e.starts_at)}/${stamp(end(e))}`,
    details: [e.description, `${SITE_URL}/renginiai`].filter(Boolean).join("\n\n"),
    location: e.location ?? "",
    ctz: "Europe/Vilnius",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
