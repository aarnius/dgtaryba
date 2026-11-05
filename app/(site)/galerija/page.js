import Ransom from "@/components/Ransom";
import VideoEmbed from "@/components/VideoEmbed";
import { getAlbums, getVideos } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Galerija ir video",
  description: "Nuotraukos ir video iš Dariaus ir Girėno gimnazijos renginių.",
  alternates: { canonical: "/galerija" },
};

const fmt = new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Vilnius" });

export default async function GalleryPage() {
  const [albums, videos] = await Promise.all([getAlbums(), getVideos()]);
  return (
    <>
      <div className="page-head">
        <Ransom text="Galerija" seed={91} />
        <p className="muted">Akimirkos iš mūsų renginių.</p>
      </div>

      {videos.length > 0 && (
        <section className="section">
          <h2>Naujausi video</h2>
          <div className="video-row">{videos.map((v) => <VideoEmbed key={v.id} v={v} />)}</div>
        </section>
      )}

      <section className="section">
        <h2>Albumai</h2>
        {albums.length === 0 ? (
          <div className="card empty"><span className="big">🖼️</span>Albumų dar nėra</div>
        ) : (
          <div className="album-grid">
            {albums.map((a) => (
              <a key={a.id} href={`/galerija/${a.id}`} className="album">
                <div className="album-cover">{a.cover ? <img src={a.cover} alt="" loading="lazy" /> : <span>📷</span>}</div>
                <div className="album-info">
                  <strong>{a.title}</strong>
                  <span className="muted small">{a.event_date ? fmt.format(new Date(a.event_date)) + " · " : ""}{a.photo_count} nuotr.</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
