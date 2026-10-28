const TZ = "Europe/Vilnius";

export function formatDay(date) {
  return new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, day: "numeric" }).format(new Date(date));
}

export function formatMonth(date) {
  return new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, month: "short" }).format(new Date(date)).replace(".", "");
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
