"use client";

import { useEffect, useState } from "react";

import { vilniusNow, fmtLeft as fmt, bellStatus as status } from "@/lib/bellStatus";

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
