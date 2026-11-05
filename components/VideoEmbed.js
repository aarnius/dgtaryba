"use client";

import { useEffect, useState } from "react";
import { embedUrl, PLATFORM_LABEL } from "@/lib/videos";

const KEY = "dg-embeds";

// Trečiųjų šalių video (Instagram/TikTok/YouTube) naudoja savo slapukus,
// todėl įkeliame tik lankytojui sutikus (Elektroninių ryšių įstatymas, BDAR)
export default function VideoEmbed({ v }) {
  const [on, setOn] = useState(false);
  const [remember, setRemember] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "1") setOn(true); } catch {}
    const sync = () => { try { if (localStorage.getItem(KEY) === "1") setOn(true); } catch {} };
    window.addEventListener("dg-embeds", sync);
    return () => window.removeEventListener("dg-embeds", sync);
  }, []);

  const src = embedUrl(v);
  if (!src) return null;
  const label = PLATFORM_LABEL[v.platform];

  function allow() {
    if (remember) {
      try { localStorage.setItem(KEY, "1"); } catch {}
      window.dispatchEvent(new Event("dg-embeds"));
    }
    setOn(true);
  }

  return (
    <figure className={`video ${v.platform}`}>
      <div className="video-frame">
        {on ? (
          <iframe src={src} title={v.title || `${label} video`} loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation" />
        ) : (
          <div className="video-consent">
            <span className={`plat ${v.platform}`}>{label}</span>
            <button type="button" className="play" onClick={allow} aria-label={`Rodyti ${label} video`}>▶</button>
            <p className="small">Paspaudus bus įkeltas {label} turinys. {label} gali naudoti slapukus ir matyti tavo IP adresą.</p>
            <label className="check small"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Visada rodyti video</label>
            <a href="/privatumas#slapukai" className="small muted">Daugiau apie slapukus</a>
          </div>
        )}
      </div>
      <figcaption>
        <span className={`plat ${v.platform}`}>{label}</span>
        {v.title && <span className="t">{v.title}</span>}
        <a href={v.url} target="_blank" rel="noopener noreferrer" className="muted small">Atidaryti ↗</a>
      </figcaption>
    </figure>
  );
}
