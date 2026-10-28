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
