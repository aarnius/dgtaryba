import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import VideoEmbed from "@/components/VideoEmbed";
import { adminGate } from "@/components/AdminGate";
import { ConfirmButton } from "@/components/Forms";
import { ActionForm, PhotoUploader } from "@/components/MediaForms";
import { getAlbums, getAlbum, getVideos } from "@/lib/content";
import { createAlbum, deletePhoto, deleteAlbum, addVideo, deleteVideo } from "@/app/content-actions";
import { PLATFORM_LABEL } from "@/lib/videos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galerija", robots: { index: false } };

function IdForm({ action, id, children }) {
  return <form action={action}><input type="hidden" name="id" value={id} />{children}</form>;
}

export default async function AdminGallery({ searchParams }) {
  const { user, block } = await adminGate("council");
  if (block) return block;
  const { albumas } = await searchParams;
  const [albums, videos, album] = await Promise.all([getAlbums(), getVideos(50), albumas ? getAlbum(Number(albumas) || 0) : null]);

  return (
    <>
      <div className="page-head">
        <Ransom text="Galerija" className="sm" seed={93} />
        <AdminTabs active="galerija" user={user} />
      </div>

      {album ? (
        <section className="admin-section">
          <p><a href="/admin/galerija" className="section-link">← Visi albumai</a></p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>📁 {album.title} <span className="tag">{album.photos.length}</span></h2>
            <div className="actions">
              <a href={`/galerija/${album.id}`} className="btn ghost small" target="_blank">Peržiūrėti ↗</a>
              <IdForm action={deleteAlbum} id={album.id}>
                <ConfirmButton className="btn danger small" message={`Ištrinti visą albumą „${album.title}“ su ${album.photos.length} nuotr.?`}>Ištrinti albumą</ConfirmButton>
              </IdForm>
            </div>
          </div>
          <div style={{ margin: "16px 0" }}><PhotoUploader albumId={album.id} /></div>
          <div className="thumb-grid">
            {album.photos.map((p) => (
              <div key={p.id} className="thumb">
                <img src={p.url} alt="" loading="lazy" />
                <IdForm action={deletePhoto} id={p.id}><ConfirmButton className="icon-btn danger" message="Ištrinti nuotrauką?" title="Ištrinti">🗑</ConfirmButton></IdForm>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-section">
          <h2>📸 Albumai <span className="tag">{albums.length}</span></h2>
          <div className="two-col">
            <div className="album-grid small">
              {albums.length === 0 && <div className="card empty small">Sukurk pirmą albumą →</div>}
              {albums.map((a) => (
                <a key={a.id} href={`/admin/galerija?albumas=${a.id}`} className="album">
                  <div className="album-cover">{a.cover ? <img src={a.cover} alt="" loading="lazy" /> : <span>📷</span>}</div>
                  <div className="album-info"><strong>{a.title}</strong><span className="muted small">{a.photo_count} nuotr.</span></div>
                </a>
              ))}
            </div>
            <ActionForm action={createAlbum} title="Naujas albumas" submit="Sukurti ir įkelti nuotraukas →">
              <label className="field"><span>Pavadinimas</span><input name="title" required maxLength={120} placeholder="Helovino diskoteka 2026" /></label>
              <label className="field"><span>Renginio data (nebūtina)</span><input name="day" type="date" /></label>
            </ActionForm>
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2>🎬 Video <span className="tag">{videos.length}</span></h2>
        <div className="two-col">
          <div>
            {videos.length === 0 && <div className="card empty small">Įklijuok pirmo video nuorodą →</div>}
            <div className="video-row">
              {videos.map((v) => (
                <div key={v.id} className="video-admin">
                  <VideoEmbed v={v} />
                  <IdForm action={deleteVideo} id={v.id}>
                    <ConfirmButton className="btn danger small" message={`Pašalinti šį ${PLATFORM_LABEL[v.platform]} video?`}>Pašalinti</ConfirmButton>
                  </IdForm>
                </div>
              ))}
            </div>
          </div>
          <ActionForm action={addVideo} title="Pridėti video" submit="Pridėti">
            <label className="field"><span>Nuoroda</span><input name="url" required inputMode="url" placeholder="https://www.instagram.com/reel/… arba tiktok.com/@…/video/…" /></label>
            <label className="field"><span>Pavadinimas (nebūtina)</span><input name="title" maxLength={120} /></label>
            <small className="muted">Instagram: prie įrašo ⋯ → „Kopijuoti nuorodą". TikTok: Dalintis → „Kopijuoti nuorodą". Tinka ir YouTube.</small>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
