import { notFound } from "next/navigation";
import { getAlbum } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const a = await getAlbum(Number(id) || 0);
  if (!a) return { title: "Albumas nerastas" };
  return {
    title: a.title,
    description: `Nuotraukos: ${a.title}. Dariaus ir Girėno gimnazijos mokinių taryba.`,
    alternates: { canonical: `/galerija/${a.id}` },
    openGraph: a.photos[0] ? { images: [a.photos[0].url] } : undefined,
  };
}

const fmt = new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Vilnius" });

export default async function AlbumPage({ params }) {
  const { id } = await params;
  const album = await getAlbum(Number(id) || 0);
  if (!album) notFound();

  return (
    <>
      <div className="page-head">
        <a href="/galerija" className="section-link" style={{ margin: 0 }}>← Galerija</a>
        <h1 className="album-title">{album.title}</h1>
        <p className="muted">{album.event_date ? fmt.format(new Date(album.event_date)) + " · " : ""}{album.photos.length} nuotr.</p>
      </div>
      {album.photos.length === 0 ? (
        <div className="card empty">Nuotraukų dar nėra</div>
      ) : (
        <div className="masonry">
          {album.photos.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener" className="shot">
              <img src={p.url} alt={album.title} loading="lazy" width={p.width || undefined} height={p.height || undefined} />
            </a>
          ))}
        </div>
      )}
    </>
  );
}
