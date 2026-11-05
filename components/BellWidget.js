"use client";

import { useEffect, useState } from "react";

const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

// Dabartinis laikas Vilniuje sekundėmis nuo vidurnakčio + savaitės diena
function vilniusNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vilnius", hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const h = Number(parts.hour) % 24;
  return { sec: h * 3600 + Number(parts.minute) * 60 + Number(parts.second), weekend: ["Sat", "Sun"].includes(parts.weekday) };
}

function fmt(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return m >= 60 ? `${Math.floor(m / 60)} val. ${m % 60} min.` : `${m}:${String(s).padStart(2, "0")}`;
}

function status(bells, { sec, weekend }) {
  if (weekend) return { kind: "off", title: "Savaitgalis 🎉", sub: "Pamokos pirmadienį nuo " + bells[0].start };
  for (const [i, b] of bells.entries()) {
    const s = toMin(b.start) * 60, e = toMin(b.end) * 60;
    if (sec < s) {
      const prevEnd = i ? toMin(bells[i - 1].end) * 60 : null;
      if (prevEnd === null) return { kind: "before", title: "Iki pamokų", left: s - sec, sub: `${b.n} pamoka ${b.start}` };
      return { kind: "break", title: s - prevEnd >= 20 * 60 ? "Ilgoji pertrauka 🥪" : "Pertrauka", left: s - sec, sub: `iki ${b.n} pamokos`, progress: (sec - prevEnd) / (s - prevEnd), n: b.n };
    }
    if (sec < e) return { kind: "lesson", title: `${b.n} pamoka`, left: e - sec, sub: "iki skambučio", progress: (sec - s) / (e - s), n: b.n };
  }
  return { kind: "off", title: "Pamokos baigėsi 👋", sub: "Rytoj nuo " + bells[0].start };
}

export default function BellWidget({ bells }) {
  const [now, setNow] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tick = () => setNow(vilniusNow());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (!bells?.length) return null;
  const st = now ? status(bells, now) : null;

  return (
    <div className={`card bell ${st?.kind ?? ""}`}>
      <h3>Pamokų laikas</h3>
      {!st ? (
        <div className="bell-main"><span className="digits">--:--</span></div>
      ) : (
        <>
          <div className="bell-main">
            <div>
              <strong className="bell-title">{st.title}</strong>
              <div className="muted small">{st.sub}</div>
            </div>
            {st.left != null && <span className="digits" aria-live="off">{fmt(st.left)}</span>}
          </div>
          {st.progress != null && (
            <div className="bell-bar" aria-hidden><span style={{ width: `${Math.round(st.progress * 100)}%` }} /></div>
          )}
        </>
      )}
      <button type="button" className="bell-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "Slėpti tvarkaraštį ▲" : "Visas tvarkaraštis ▼"}
      </button>
      {open && (
        <ol className="bell-list">
          {bells.map((b) => (
            <li key={b.n} className={st?.n === b.n && st.kind === "lesson" ? "now" : ""}>
              <span>{b.n}.</span><span className="mono">{b.start} – {b.end}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
