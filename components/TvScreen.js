"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Ransom from "./Ransom";
import { vilniusNow, bellStatus, fmtLeft } from "@/lib/bellStatus";
import { eventChip, formatEventWhen, eventCountdown } from "@/lib/format";

const TZ = "Europe/Vilnius";
const clockFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const wdFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, weekday: "long" });
const mdFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, month: "long", day: "numeric" });
const hmFmt = new Intl.DateTimeFormat("lt-LT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
// „Trečiadienis, lapkričio 11 d.“
const longDate = (d) => `${cap(wdFmt.format(d))}, ${mdFmt.format(d)}`;


// 1920×1080 „scena“, kuri automatiškai prisitaiko prie bet kokio ekrano
function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return scale;
}

export default function TvScreen({ tv, bells, events, ideas, poll, photos, ticker, qrSvg }) {
  const router = useRouter();
  const scale = useStageScale();
  const [now, setNow] = useState(null);
  const [idx, setIdx] = useState(0);
  const [cursor, setCursor] = useState(false);
  const cursorT = useRef(null);

  // Laikrodis kas sekundę, duomenys kas 3 min., pilnas perkrovimas kas 6 val. (jei būtų atnaujinta svetainė)
  useEffect(() => {
    const tick = () => setNow({ ...vilniusNow(), date: new Date() });
    tick();
    const a = setInterval(tick, 1000);
    const b = setInterval(() => router.refresh(), 3 * 60 * 1000);
    const c = setTimeout(() => location.reload(), 6 * 3600 * 1000);
    return () => { clearInterval(a); clearInterval(b); clearTimeout(c); };
  }, [router]);

  const slides = useMemo(() => {
    const out = [];
    if (tv.show.events && events.length) out.push({ key: "events", kind: "events" });
    if (tv.show.ideas && ideas.length) out.push({ key: "ideas", kind: "ideas" });
    if (tv.show.poll && poll) out.push({ key: "poll", kind: "poll" });
    for (const s of tv.slides) out.push({ key: s.id, kind: "custom", s });
    if (tv.show.photos && photos.length >= 3) out.push({ key: "photos", kind: "photos" });
    if (!out.length) out.push({ key: "welcome", kind: "welcome" });
    return out;
  }, [tv, events, ideas, poll, photos]);

  const secs = tv.slide_seconds || 12;
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), secs * 1000);
    return () => clearInterval(t);
  }, [slides.length, secs]);
  const cur = slides[idx % slides.length];

  const st = now && bells?.length ? bellStatus(bells, now) : null;
  const fullscreen = () => document.documentElement.requestFullscreen?.().catch(() => {});
  const showCursor = () => {
    setCursor(true);
    clearTimeout(cursorT.current);
    cursorT.current = setTimeout(() => setCursor(false), 3000);
  };
  const tickerText = ticker.length ? ticker.join("   ✦   ") : "";

  return (
    <div className={`tv ${cursor ? "show-cursor" : ""}`} onMouseMove={showCursor} onClick={fullscreen}>
      <div className="tv-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div className="tv-bg" style={tv.background_url ? { backgroundImage: `url(${tv.background_url})` } : undefined} />
        <div className="tv-shade" />

        <header className="tv-head">
          <div className="tv-brand">
            <Ransom text="Mokinių taryba" as="div" seed={3} className="tv-logo" />
            <div className="tv-headline">{tv.headline}</div>
          </div>
          <div className="tv-clock">
            <div className="tv-time">{now ? clockFmt.format(now.date) : "--:--"}</div>
            <div className="tv-date">{now ? longDate(now.date) : ""}</div>
          </div>
        </header>

        <div className="tv-main">
          {/* ---- Pamokų laikas ---- */}
          <section className={`tv-bell ${st?.kind ?? ""}`}>
            <div className="tv-label">Pamokų laikas</div>
            {st ? (
              <>
                <div className="tv-bell-title">{st.title}</div>
                {st.left != null && <div className="tv-bell-left">{fmtLeft(st.left)}</div>}
                <div className="tv-bell-sub">{st.sub}</div>
                {st.progress != null && <div className="tv-bar"><span style={{ width: `${Math.round(st.progress * 100)}%` }} /></div>}
                {st.kind === "lesson" && st.next && <div className="tv-bell-next">Toliau: pertrauka, {st.next.n} pamoka {st.next.start}</div>}
              </>
            ) : (
              <div className="tv-bell-left">--:--</div>
            )}
            <ol className="tv-bells">
              {bells.map((b) => (
                <li key={b.n} className={st?.n === b.n ? (st.kind === "lesson" ? "now" : "soon") : ""}>
                  <span>{b.n}</span><span>{b.start}–{b.end}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ---- Besikeičiančios skaidrės ---- */}
          <section className="tv-slides">
            <div key={cur.key + idx} className={`tv-slide ${cur.kind}`}>
              {cur.kind === "events" && (
                <>
                  <h2 className="tv-h">📅 Renginiai / Įvykiai</h2>
                  <div className="tv-events">
                    {events.slice(0, 3).map((e) => {
                      const chip = eventChip(e);
                      const cd = eventCountdown(e);
                      return (
                      <div key={e.id} className="tv-event">
                        <div className={`tv-chip${chip.wide ? " wide" : ""}`}><span>{chip.m}</span><b>{chip.d}</b></div>
                        <div className="tv-event-info">
                          <div className="tv-event-title">{e.emoji} {e.title}</div>
                          <div className="tv-muted">{formatEventWhen(e)}{e.location ? ` · ${e.location}` : ""}</div>
                        </div>
                        <div className={`tv-pill${cd.startsWith("vyksta") ? " live" : ""}`}>{cap(cd)}</div>
                      </div>
                      );
                    })}
                  </div>
                </>
              )}
              {cur.kind === "ideas" && (
                <>
                  <h2 className="tv-h">💡 Populiariausios idėjos</h2>
                  <ol className="tv-ideas">
                    {ideas.slice(0, 4).map((i, n) => (
                      <li key={i.id}><span className="tv-rank">{n + 1}</span><span className="tv-idea">{i.title}</span><span className="tv-heart">♥ {i.votes}</span></li>
                    ))}
                  </ol>
                  <div className="tv-hint">Turi geresnę? Siūlyk ir balsuok <b>{tv.url_text}/idejos</b></div>
                </>
              )}
              {cur.kind === "poll" && (() => {
                const total = poll.options.reduce((a, o) => a + o.votes, 0);
                return (
                  <>
                    <h2 className="tv-h">📊 Apklausa</h2>
                    <div className="tv-question">{poll.question}</div>
                    <div className="tv-results">
                      {poll.options.map((o) => {
                        const pct = total ? Math.round((o.votes / total) * 100) : 0;
                        return (
                          <div key={o.id} className="tv-result">
                            <span className="tv-fill" style={{ width: `${pct}%` }} />
                            <span className="tv-opt">{o.label}</span><span className="tv-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="tv-hint">Balsavo {total}. Prisidėk: <b>{tv.url_text}/apklausos</b></div>
                  </>
                );
              })()}
              {cur.kind === "photos" && (
                <>
                  <h2 className="tv-h">📸 Akimirkos</h2>
                  <div className="tv-photos">{photos.slice(0, 6).map((u) => <img key={u} src={u} alt="" />)}</div>
                </>
              )}
              {cur.kind === "custom" && (
                <div className={`tv-custom ${cur.s.image_url ? "has-img" : ""}`}>
                  {cur.s.image_url && <img src={cur.s.image_url} alt="" />}
                  {(cur.s.title || cur.s.text) && (
                    <div className="tv-custom-text">
                      {cur.s.title && <div className="tv-custom-title">{cur.s.title}</div>}
                      {cur.s.text && <div className="tv-custom-body">{cur.s.text}</div>}
                    </div>
                  )}
                </div>
              )}
              {cur.kind === "welcome" && (
                <div className="tv-welcome"><Ransom text="Labas!" as="div" seed={5} className="tv-logo xl" /><p>{tv.cta}</p></div>
              )}
            </div>
            <div className="tv-dots">
              {slides.map((s, i) => <span key={s.key} className={i === idx % slides.length ? "on" : ""} style={i === idx % slides.length ? { animationDuration: `${secs}s` } : undefined} />)}
            </div>
          </section>
        </div>

        <footer className="tv-foot">
          <div className="tv-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <div className="tv-cta">
            <div className="tv-cta-text">{tv.cta}</div>
            <div className="tv-url">{tv.url_text}</div>
          </div>
        </footer>

        {tickerText && (
          <div className="tv-ticker"><div className="tv-ticker-track" style={{ animationDuration: `${Math.max(30, tickerText.length * 0.28)}s` }}><span>{tickerText}</span><span aria-hidden>{tickerText}</span></div></div>
        )}
      </div>
      {cursor && <div className="tv-fs-hint">Spausk ekraną arba F11, kad būtų per visą ekraną</div>}
    </div>
  );
}
