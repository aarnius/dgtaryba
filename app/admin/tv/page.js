import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import { adminGate } from "@/components/AdminGate";
import { SubmitButton, ConfirmButton } from "@/components/Forms";
import { ActionForm, ImageField } from "@/components/MediaForms";
import { getTv } from "@/lib/tv";
import { saveTvSettings, addTvSlide, deleteTvSlide, moveTvSlide } from "@/app/tv-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "TV ekranas", robots: { index: false } };

function IdForm({ action, id, children, extra }) {
  return <form action={action}><input type="hidden" name="id" value={id} />{extra}{children}</form>;
}

const SHOW = [
  ["events", "📅 Artėjantys renginiai"],
  ["ideas", "💡 Populiariausios idėjos"],
  ["poll", "📊 Aktyvi apklausa"],
  ["photos", "📸 Naujausios galerijos nuotraukos"],
];

export default async function AdminTv() {
  const { user, block } = await adminGate("tv");
  if (block) return block;
  const tv = await getTv();

  return (
    <>
      <div className="page-head">
        <Ransom text="TV ekranas" className="sm" seed={73} />
        <AdminTabs active="tv" user={user} />
      </div>

      <div className="card tv-howto">
        <div>
          <strong>Kaip įjungti mokyklos televizoriuje</strong>
          <ol className="small">
            <li>Televizoriaus ar prie jo prijungto kompiuterio naršyklėje atsidaryk <b>dgtaryba.lt/tv</b></li>
            <li>Spausk ekraną arba <b>F11</b>, kad būtų per visą ekraną</li>
            <li>Viskas! Ekranas pats atsinaujina, o pamokų laikas ir laikrodis eina realiu laiku</li>
          </ol>
        </div>
        <a href="/tv" target="_blank" className="btn">📺 Atidaryti TV ekraną ↗</a>
      </div>

      <section className="admin-section">
        <h2>⚙️ Nustatymai</h2>
        <div className="two-col">
          <ActionForm action={saveTvSettings} submit="Išsaugoti">
            <ImageField label="Fono nuotrauka (nebūtina)" current={tv.background_url} max={1920} wide />
            <label className="field"><span>Antraštė po logotipu</span><input name="headline" maxLength={80} defaultValue={tv.headline} /></label>
            <label className="field"><span>Kvietimas apačioje (prie QR kodo)</span><input name="cta" maxLength={140} defaultValue={tv.cta} /></label>
            <label className="field"><span>Didelis adresas apačioje</span><input name="url_text" maxLength={60} defaultValue={tv.url_text} /></label>
            <label className="field"><span>Bėganti eilutė (po vieną žinutę eilutėje)</span><textarea name="ticker" rows={4} defaultValue={tv.ticker.join("\n")} /></label>
            <small className="muted">Skelbimų juostos iš puslapio redaktoriaus į bėgančią eilutę patenka automatiškai.</small>
            <div className="field">
              <span>Ką rodyti skaidrėse</span>
              <div className="perm-grid">
                {SHOW.map(([k, label]) => (
                  <label key={k} className="perm"><input type="checkbox" name={`show_${k}`} value="1" defaultChecked={tv.show[k]} /><span>{label}</span></label>
                ))}
              </div>
            </div>
            <label className="field"><span>Kiek sekundžių rodyti vieną skaidrę</span><input name="slide_seconds" type="number" min={5} max={60} defaultValue={tv.slide_seconds} /></label>
          </ActionForm>
          <p className="muted small">
            Skaidrės keičiasi ratu: renginiai → idėjos → apklausa → jūsų skaidrės → nuotraukos.
            Kairėje visada matosi pamokų laikas (jį keisti gali <a href="/admin/puslapis" className="section-link" style={{ margin: 0 }}>puslapio redaktoriuje</a>).
          </p>
        </div>
      </section>

      <section className="admin-section">
        <h2>🖼️ Jūsų skaidrės <span className="tag">{tv.slides.length}</span></h2>
        <div className="two-col">
          <div className="card">
            {tv.slides.length === 0 && <p className="muted" style={{ margin: 0 }}>Pridėk skaidrę: pvz. renginio plakatą, sveikinimą ar skelbimą →</p>}
            {tv.slides.map((s, i) => (
              <div key={s.id} className="admin-row">
                <div className="info" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="wide-preview" style={{ width: 120 }}>{s.image_url ? <img src={s.image_url} alt="" /> : <span>📝</span>}</div>
                  <div><strong>{s.title || "(be pavadinimo)"}</strong>{s.text && <div className="muted small">{s.text}</div>}</div>
                </div>
                <div className="actions">
                  <IdForm action={moveTvSlide} id={s.id} extra={<input type="hidden" name="dir" value="up" />}>
                    <SubmitButton className="icon-btn" pendingText="…" disabled={i === 0} title="Aukštyn">↑</SubmitButton>
                  </IdForm>
                  <IdForm action={moveTvSlide} id={s.id} extra={<input type="hidden" name="dir" value="down" />}>
                    <SubmitButton className="icon-btn" pendingText="…" disabled={i === tv.slides.length - 1} title="Žemyn">↓</SubmitButton>
                  </IdForm>
                  <IdForm action={deleteTvSlide} id={s.id}>
                    <ConfirmButton className="icon-btn danger" message="Ištrinti skaidrę?" title="Ištrinti">🗑</ConfirmButton>
                  </IdForm>
                </div>
              </div>
            ))}
          </div>
          <ActionForm action={addTvSlide} title="Nauja skaidrė" submit="Pridėti">
            <ImageField label="Nuotrauka ar plakatas (geriausia gulsčias)" max={1920} wide />
            <label className="field"><span>Pavadinimas</span><input name="title" maxLength={80} placeholder="Kalėdinė diskoteka gruodžio 18 d.!" /></label>
            <label className="field"><span>Tekstas (nebūtina)</span><textarea name="text" rows={2} maxLength={280} placeholder="Bilietai ilgosios pertraukos metu prie valgyklos" /></label>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
