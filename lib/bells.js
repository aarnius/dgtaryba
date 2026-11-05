// Skambučių tvarkaraštis (iš dgg.lt). Taryba gali pakeisti /admin/puslapis.
export const DEFAULT_BELLS = [
  { n: 1, start: "08:00", end: "08:45" },
  { n: 2, start: "08:55", end: "09:40" },
  { n: 3, start: "09:50", end: "10:35" },
  { n: 4, start: "11:05", end: "11:50" },
  { n: 5, start: "12:00", end: "12:45" },
  { n: 6, start: "12:55", end: "13:40" },
  { n: 7, start: "13:50", end: "14:35" },
];

export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// "1 08:00-08:45" eilutės → [{n,start,end}] arba { error }
export function parseBells(text) {
  const out = [];
  for (const [i, raw] of String(text).split("\n").entries()) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(\d{1,2})[.)]?\s+(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})$/);
    if (!m) return { error: `${i + 1} eilutė neatpažinta: „${line}“. Rašyk pvz. 1 08:00-08:45` };
    const pad = (x) => String(x).padStart(2, "0");
    const start = `${pad(m[2])}:${m[3]}`, end = `${pad(m[4])}:${m[5]}`;
    if (toMin(end) <= toMin(start)) return { error: `${i + 1} eilutė: pabaiga turi būti po pradžios` };
    if (out.length && toMin(start) < toMin(out[out.length - 1].end)) return { error: `${i + 1} eilutė persidengia su ankstesne pamoka` };
    out.push({ n: Number(m[1]), start, end });
  }
  if (!out.length) return { error: "Įrašyk bent vieną pamoką" };
  return { bells: out.slice(0, 12) };
}

export const formatBells = (bells) => bells.map((b) => `${b.n} ${b.start}-${b.end}`).join("\n");
