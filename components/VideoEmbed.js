import { embedUrl, PLATFORM_LABEL } from "@/lib/videos";

export default function VideoEmbed({ v }) {
  const src = embedUrl(v);
  if (!src) return null;
  return (
    <figure className={`video ${v.platform}`}>
      <div className="video-frame">
        <iframe src={src} title={v.title || `${PLATFORM_LABEL[v.platform]} video`} loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write" allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation" />
      </div>
      <figcaption>
        <span className={`plat ${v.platform}`}>{PLATFORM_LABEL[v.platform]}</span>
        {v.title && <span className="t">{v.title}</span>}
        <a href={v.url} target="_blank" rel="noopener noreferrer" className="muted small">Atidaryti ↗</a>
      </figcaption>
    </figure>
  );
}
