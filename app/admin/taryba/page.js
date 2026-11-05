import Ransom from "@/components/Ransom";
import AdminTabs from "@/components/AdminTabs";
import { adminGate } from "@/components/AdminGate";
import { SubmitButton, ConfirmButton } from "@/components/Forms";
import { ActionForm, ImageField } from "@/components/MediaForms";
import { getCouncil, getDecisions } from "@/lib/content";
import { sql } from "@/lib/db";
import {
  saveCouncilMember, moveCouncilMember, deleteCouncilMember,
  saveDecision, deleteDecision, saveAchievement, deleteAchievement,
} from "@/app/content-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Taryba", robots: { index: false } };

const fmt = new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "short", day: "numeric", timeZone: "Europe/Vilnius" });
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Vilnius" });

function IdForm({ action, id, children, extra }) {
  return <form action={action}><input type="hidden" name="id" value={id} />{extra}{children}</form>;
}

function MemberFields({ m }) {
  return (
    <>
      {m && <input type="hidden" name="id" value={m.id} />}
      <ImageField current={m?.photo_url} />
      <label className="field"><span>Vardas, pavardė</span><input name="name" required maxLength={80} defaultValue={m?.name ?? ""} /></label>
      <div className="grid-2">
        <label className="field"><span>Pareigos</span><input name="role" maxLength={80} placeholder="Pirmininkė" defaultValue={m?.role ?? ""} /></label>
        <label className="field"><span>Klasė</span><input name="class_name" maxLength={20} placeholder="3c" defaultValue={m?.class_name ?? ""} /></label>
      </div>
      <label className="field"><span>Apie (nebūtina)</span><textarea name="bio" rows={2} maxLength={600} defaultValue={m?.bio ?? ""} /></label>
      <label className="field"><span>Kontaktas (nebūtina)</span><input name="contact" maxLength={120} placeholder="@instagram arba el. paštas" defaultValue={m?.contact ?? ""} /></label>
    </>
  );
}

export default async function AdminCouncil({ searchParams }) {
  const { user, block } = await adminGate("council");
  if (block) return block;
  const { narys } = await searchParams;
  const [members, decisions, achievements] = await Promise.all([
    getCouncil(), getDecisions(50), sql`SELECT * FROM achievements ORDER BY done_on DESC, id DESC LIMIT 50`,
  ]);
  const editing = members.find((m) => m.id === Number(narys));

  return (
    <>
      <div className="page-head">
        <Ransom text="Taryba" className="sm" seed={83} />
        <AdminTabs active="taryba" user={user} />
      </div>

      <section className="admin-section">
        <h2>🙋 Nariai <span className="tag">{members.length}</span></h2>
        <div className="two-col">
          <div className="card">
            {members.length === 0 && <p className="muted" style={{ margin: 0 }}>Pridėk pirmą narį →</p>}
            {members.map((m, i) => (
              <div key={m.id} className={`admin-row ${editing?.id === m.id ? "is-editing" : ""}`}>
                <div className="info" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="avatar">{m.photo_url ? <img src={m.photo_url} alt="" /> : <span>{m.name[0]}</span>}</div>
                  <div><strong>{m.name}</strong><div className="muted small">{[m.role, m.class_name && `${m.class_name} kl.`].filter(Boolean).join(" · ")}</div></div>
                </div>
                <div className="actions">
                  <IdForm action={moveCouncilMember} id={m.id} extra={<input type="hidden" name="dir" value="up" />}>
                    <SubmitButton className="icon-btn" pendingText="…" disabled={i === 0} title="Aukštyn">↑</SubmitButton>
                  </IdForm>
                  <IdForm action={moveCouncilMember} id={m.id} extra={<input type="hidden" name="dir" value="down" />}>
                    <SubmitButton className="icon-btn" pendingText="…" disabled={i === members.length - 1} title="Žemyn">↓</SubmitButton>
                  </IdForm>
                  <a className="icon-btn" href={`/admin/taryba?narys=${m.id}#nario-forma`} title="Redaguoti">✎</a>
                  <IdForm action={deleteCouncilMember} id={m.id}>
                    <ConfirmButton className="icon-btn danger" message={`Pašalinti ${m.name}?`} title="Pašalinti">🗑</ConfirmButton>
                  </IdForm>
                </div>
              </div>
            ))}
          </div>
          <div id="nario-forma">
            <ActionForm key={editing?.id ?? "new"} action={saveCouncilMember} title={editing ? "Redaguoti narį" : "Naujas narys"} submit={editing ? "Išsaugoti" : "Pridėti"}>
              <MemberFields m={editing} />
            </ActionForm>
            {editing && <p style={{ marginTop: 8 }}><a href="/admin/taryba" className="section-link">Atšaukti</a></p>}
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2>✅ Nuveikti darbai</h2>
        <div className="two-col">
          <div className="card">
            <p className="muted small" style={{ marginTop: 0 }}>Idėjos, pažymėtos „Įgyvendinta", čia atsiranda automatiškai.</p>
            {achievements.length === 0 && <p className="muted" style={{ margin: 0 }}>Kol kas tuščia</p>}
            {achievements.map((a) => (
              <div key={a.id} className="admin-row">
                <div className="info"><strong>{a.emoji} {a.title}</strong><div className="muted small">{fmt.format(new Date(a.done_on))}</div></div>
                <IdForm action={deleteAchievement} id={a.id}><ConfirmButton className="icon-btn danger" message="Ištrinti?" title="Ištrinti">🗑</ConfirmButton></IdForm>
              </div>
            ))}
          </div>
          <ActionForm action={saveAchievement} title="Pridėti nuveiktą darbą" submit="Pridėti">
            <div className="grid-2" style={{ gridTemplateColumns: "70px 1fr" }}>
              <input name="emoji" placeholder="✅" maxLength={8} style={{ textAlign: "center" }} />
              <input name="title" placeholder="Pvz. Nupirkome stalo futbolą" required maxLength={200} />
            </div>
            <label className="field"><span>Data</span><input name="day" type="date" defaultValue={today()} /></label>
            <label className="field"><span>Plačiau (nebūtina)</span><textarea name="body" rows={2} maxLength={1000} /></label>
          </ActionForm>
        </div>
      </section>

      <section className="admin-section">
        <h2>📜 Sprendimai</h2>
        <div className="two-col">
          <div className="card">
            {decisions.length === 0 && <p className="muted" style={{ margin: 0 }}>Kol kas tuščia</p>}
            {decisions.map((d) => (
              <div key={d.id} className="admin-row">
                <div className="info"><strong>{d.title}</strong><div className="muted small">{fmt.format(new Date(d.decided_on))}</div></div>
                <IdForm action={deleteDecision} id={d.id}><ConfirmButton className="icon-btn danger" message="Ištrinti?" title="Ištrinti">🗑</ConfirmButton></IdForm>
              </div>
            ))}
          </div>
          <ActionForm action={saveDecision} title="Naujas sprendimas" submit="Pridėti">
            <label className="field"><span>Sprendimas</span><input name="title" required maxLength={200} placeholder="Kalėdinė diskoteka vyks gruodžio 18 d." /></label>
            <label className="field"><span>Data</span><input name="day" type="date" defaultValue={today()} /></label>
            <label className="field"><span>Paaiškinimas (nebūtina)</span><textarea name="body" rows={2} maxLength={2000} /></label>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
