// Pamokų būsenos skaičiavimas (naudoja pagrindinis puslapis ir TV ekranas)

export const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// Dabartinis laikas Vilniuje sekundėmis nuo vidurnakčio + savaitės diena
export function vilniusNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vilnius", hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const h = Number(parts.hour) % 24;
  return { sec: h * 3600 + Number(parts.minute) * 60 + Number(parts.second), weekend: ["Sat", "Sun"].includes(parts.weekday) };
}

export function fmtLeft(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m >= 60 ? `${Math.floor(m / 60)} val. ${m % 60} min.` : `${m}:${String(s).padStart(2, "0")}`;
}

export function bellStatus(bells, { sec, weekend }) {
  if (weekend) return { kind: "off", title: "Savaitgalis 🎉", sub: "Pamokos pirmadienį nuo " + bells[0].start };
  for (const [i, b] of bells.entries()) {
    const s = toMin(b.start) * 60, e = toMin(b.end) * 60;
    if (sec < s) {
      const prevEnd = i ? toMin(bells[i - 1].end) * 60 : null;
      if (prevEnd === null) return { kind: "before", title: "Iki pamokų", left: s - sec, sub: `${b.n} pamoka ${b.start}`, next: b };
      const long = s - prevEnd >= 20 * 60;
      return { kind: "break", long, title: long ? "Ilgoji pertrauka 🥪" : "Pertrauka", left: s - sec, sub: `iki ${b.n} pamokos`, progress: (sec - prevEnd) / (s - prevEnd), n: b.n, next: b };
    }
    if (sec < e) return { kind: "lesson", title: `${b.n} pamoka`, left: e - sec, sub: "iki skambučio", progress: (sec - s) / (e - s), n: b.n, next: bells[i + 1] ?? null };
  }
  return { kind: "off", title: "Pamokos baigėsi 👋", sub: "Rytoj nuo " + bells[0].start };
}
