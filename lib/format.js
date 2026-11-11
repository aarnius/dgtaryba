const TZ = "Europe/Vilnius";

export function formatDay(date) {
  return new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, day: "numeric" }).format(new Date(date));
}

const MONTHS = ["Sau", "Vas", "Kov", "Bal", "Geg", "Bir", "Lie", "Rgp", "Rgs", "Spl", "Lap", "Grd"];

export function formatMonth(date) {
  const m = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "numeric" }).format(new Date(date)));
  return MONTHS[m - 1];
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

export function daysUntil(date) {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days <= 0) return "šiandien!";
  if (days === 1) return "rytoj!";
  return `po ${days} d.`;
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "ką tik";
  if (s < 3600) return `prieš ${Math.floor(s / 60)} min.`;
  if (s < 86400) return `prieš ${Math.floor(s / 3600)} val.`;
  return `prieš ${Math.floor(s / 86400)} d.`;
}

// { d, h, m } iki datos (ne mažiau nei 0)
export function countdownParts(date) {
  const ms = Math.max(0, new Date(date).getTime() - Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(ms / 86400000)),
    h: pad(Math.floor((ms % 86400000) / 3600000)),
    m: pad(Math.floor((ms % 3600000) / 60000)),
  };
}

/* ---------- Renginių laikas (keliadieniai, visa diena) ---------- */

const partsFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric" });
const wdFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, weekday: "long" });
const mdFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, month: "long", day: "numeric" });
const monFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, month: "long" });
const hmFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const ymd = (d) => partsFmt.format(d); // „20/12/2026“
const dayNum = (d) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" }).format(d));
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);

// Pradžia ir (jei yra) paskutinė akimirka
export function eventRange(e) {
  const start = new Date(e.starts_at);
  let end = e.ends_at ? new Date(e.ends_at) : null;
  if (end && e.all_day) end = new Date(end.getTime() - 1); // paskutinė diena, ne kitos dienos 00:00
  if (end && end <= start && !e.all_day) end = null;
  const multi = !!end && ymd(start) !== ymd(end);
  return { start, end, multi };
}

// Ar renginys vyksta dabar / pasibaigė
export function eventEndsAt(e) {
  if (e.ends_at) return new Date(e.ends_at);
  const s = new Date(e.starts_at).getTime();
  return new Date(s + (e.all_day ? 86400000 : 6 * 3600000));
}
export const eventOngoing = (e, now = Date.now()) => new Date(e.starts_at).getTime() <= now && now < eventEndsAt(e).getTime();

// Kalendoriaus lapelis: „Gru“ + „20“ arba „20–22“
export function eventChip(e) {
  const { start, end, multi } = eventRange(e);
  const m = formatMonth(start);
  if (!multi) return { m, d: String(dayNum(start)), wide: false };
  const sameMonth = formatMonth(end) === m;
  return { m: sameMonth ? m : `${m}–${formatMonth(end)}`, d: `${dayNum(start)}–${dayNum(end)}`, wide: true };
}

// „Penktadienis, gruodžio 20 d. · visą dieną“, „gruodžio 20–22 d.“, „Penktadienis, gruodžio 20 d. 18:00–21:00“
export function formatEventWhen(e) {
  const { start, end, multi } = eventRange(e);
  const wd = cap(wdFmt.format(start));
  if (e.all_day) {
    if (!multi) return `${wd}, ${mdFmt.format(start)} · visą dieną`;
    if (monFmt.format(start) === monFmt.format(end)) return `${cap(mdFmt.format(start)).replace(/ d\.$/, "")}–${dayNum(end)} d.`;
    return `${cap(mdFmt.format(start))} – ${mdFmt.format(end)}`;
  }
  if (!end) return `${wd}, ${mdFmt.format(start)} ${hmFmt.format(start)}`;
  if (!multi) return `${wd}, ${mdFmt.format(start)} ${hmFmt.format(start)}–${hmFmt.format(end)}`;
  return `${cap(mdFmt.format(start))} ${hmFmt.format(start)} – ${mdFmt.format(end)} ${hmFmt.format(end)}`;
}

// „vyksta dabar!“, „šiandien!“, „rytoj!“, „po 5 d.“ (pagal kalendorines dienas Vilniuje)
export function eventCountdown(e, now = Date.now()) {
  if (eventOngoing(e, now)) return "vyksta dabar!";
  const day = (d) => { const [dd, mm, yy] = ymd(d).split("/").map(Number); return Date.UTC(yy, mm - 1, dd) / 86400000; };
  const days = day(new Date(e.starts_at)) - day(new Date(now));
  if (days <= 0) return "šiandien!";
  if (days === 1) return "rytoj!";
  return `po ${days} d.`;
}
