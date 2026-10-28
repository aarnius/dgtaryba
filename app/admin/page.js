import Ransom from "@/components/Ransom";
import { isAdmin } from "@/lib/session";
import { sql } from "@/lib/db";
import { getPolls, getUpcomingEvents } from "@/lib/queries";
import { formatDateTime, timeAgo } from "@/lib/format";
import { LoginForm, SubmitButton } from "@/components/Forms";
import {
  logout, setIdeaStatus, deleteIdea, createPoll, togglePoll, deletePoll,
  createEvent, deleteEvent, answerQuestion, deleteQuestion,
} from "@/app/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

function IdForm({ action, id, children, extra }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {extra}
      {children}
    </form>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const [pendingIdeas, liveIdeas, questions, polls, events] = await Promise.all([
    sql`SELECT * FROM ideas WHERE status = 'pending' ORDER BY created_at`,
    sql`SELECT i.*, count(v.voter)::int AS votes FROM ideas i LEFT JOIN idea_votes v ON v.idea_id = i.id
        WHERE status <> 'pending' GROUP BY i.id ORDER BY votes DESC`,
    sql`SELECT * FROM questions WHERE answer IS NULL ORDER BY created_at`,
    getPolls(null),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Ransom text="Tarybos pultas" className="sm" seed={51} />
        <form action={logout}><button className="btn ghost small">Atsijungti</button></form>
      </div>

      {/* ---- Idėjos laukia ---- */}
      <section className="admin-section">
        <h2>💡 Laukia patvirtinimo <span className="tag pending">{pendingIdeas.length}</span></h2>
        <div className="card">
          {pendingIdeas.length === 0 && <p className="muted" style={{ margin: 0 }}>Naujų idėjų nėra 🎉</p>}
          {pendingIdeas.map((i) => (
            <div key={i.id} className="admin-row">
              <div className="info">
                <strong>{i.title}</strong>
                {i.body && <p style={{ margin: "4px 0" }}>{i.body}</p>}
                <span className="muted small">{i.author || "Anonimas"} · {timeAgo(i.created_at)}</span>
              </div>
              <div className="actions">
                <IdForm action={setIdeaStatus} id={i.id} extra={<input type="hidden" name="status" value="approved" />}>
                  <SubmitButton className="btn mint small" pendingText="…">✓ Rodyti</SubmitButton>
                </IdForm>
                <IdForm action={deleteIdea} id={i.id}>
                  <SubmitButton className="btn danger small" pendingText="…">Ištrinti</SubmitButton>
                </IdForm>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Klausimai ---- */}
      <section className="admin-section">
        <h2>💬 Neatsakyti klausimai <span className="tag pending">{questions.length}</span></h2>
        <div className="card">
          {questions.length === 0 && <p className="muted" style={{ margin: 0 }}>Visi klausimai atsakyti 👏</p>}
          {questions.map((q) => (
            <div key={q.id} className="admin-row">
              <div className="info">
                <strong>❓ {q.body}</strong>
                <span className="muted small"> · {timeAgo(q.created_at)}</span>
                <form action={answerQuestion} className="form" style={{ marginTop: 10 }}>
                  <input type="hidden" name="id" value={q.id} />
                  <textarea name="answer" rows={2} placeholder="Atsakymas (bus rodomas viešai)" required />
                  <div className="actions"><SubmitButton className="btn small">Atsakyti viešai</SubmitButton></div>
                </form>
              </div>
              <IdForm action={deleteQuestion} id={q.id}>
                <SubmitButton className="btn danger small" pendingText="…">Ištrinti</SubmitButton>
              </IdForm>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Apklausos ---- */}
      <section className="admin-section">
        <h2>📊 Apklausos</h2>
        <div className="two-col">
          <div className="card">
            {polls.length === 0 && <p className="muted" style={{ margin: 0 }}>Apklausų dar nėra</p>}
            {polls.map((p) => {
              const total = p.options.reduce((s, o) => s + o.votes, 0);
              return (
                <div key={p.id} className="admin-row">
                  <div className="info">
                    <strong>{p.question}</strong> {!p.active && <span className="tag">Uždaryta</span>}
                    <p className="muted small" style={{ margin: "4px 0 0" }}>
                      {p.options.map((o) => `${o.label}: ${o.votes}`).join(" · ")} (iš viso {total})
                    </p>
                  </div>
                  <div className="actions">
                    <IdForm action={togglePoll} id={p.id}>
                      <SubmitButton className="btn ghost small" pendingText="…">{p.active ? "Uždaryti" : "Atidaryti"}</SubmitButton>
                    </IdForm>
                    <IdForm action={deletePoll} id={p.id}>
                      <SubmitButton className="btn danger small" pendingText="…">Ištrinti</SubmitButton>
                    </IdForm>
                  </div>
                </div>
              );
            })}
          </div>
          <form action={createPoll} className="card form">
            <h3>Nauja apklausa</h3>
            <input name="question" placeholder="Klausimas" required maxLength={200} />
            <textarea name="options" rows={4} placeholder={"Variantai, po vieną eilutėje\nPvz. Taip\nNe"} required />
            <SubmitButton>Sukurti</SubmitButton>
          </form>
        </div>
      </section>

      {/* ---- Renginiai ---- */}
      <section className="admin-section">
        <h2>📅 Renginiai</h2>
        <div className="two-col">
          <div className="card">
            {events.length === 0 && <p className="muted" style={{ margin: 0 }}>Būsimų renginių nėra</p>}
            {events.map((e) => (
              <div key={e.id} className="admin-row">
                <div className="info">
                  <strong>{e.emoji} {e.title}</strong>
                  <p className="muted small" style={{ margin: 0 }}>{formatDateTime(e.starts_at)}{e.location && ` · ${e.location}`}</p>
                </div>
                <IdForm action={deleteEvent} id={e.id}>
                  <SubmitButton className="btn danger small" pendingText="…">Ištrinti</SubmitButton>
                </IdForm>
              </div>
            ))}
          </div>
          <form action={createEvent} className="card form">
            <h3>Naujas renginys</h3>
            <div className="grid-2" style={{ gridTemplateColumns: "70px 1fr" }}>
              <input name="emoji" placeholder="🎉" maxLength={8} style={{ textAlign: "center" }} />
              <input name="title" placeholder="Pavadinimas" required maxLength={120} />
            </div>
            <input name="starts_at" type="datetime-local" required />
            <input name="location" placeholder="Vieta (nebūtina)" maxLength={80} />
            <textarea name="description" rows={2} placeholder="Aprašymas (nebūtina)" maxLength={600} />
            <SubmitButton>Pridėti</SubmitButton>
          </form>
        </div>
      </section>

      {/* ---- Rodomos idėjos ---- */}
      <section className="admin-section">
        <h2>✨ Rodomos idėjos</h2>
        <div className="card">
          {liveIdeas.length === 0 && <p className="muted" style={{ margin: 0 }}>Kol kas nėra</p>}
          {liveIdeas.map((i) => (
            <div key={i.id} className="admin-row">
              <div className="info">
                <strong>{i.title}</strong> <span className="tag">♥ {i.votes}</span>{" "}
                {i.status === "done" && <span className="tag done">Įgyvendinta</span>}
              </div>
              <div className="actions">
                <IdForm action={setIdeaStatus} id={i.id}
                  extra={<input type="hidden" name="status" value={i.status === "done" ? "approved" : "done"} />}>
                  <SubmitButton className="btn mint small" pendingText="…">
                    {i.status === "done" ? "↺ Grąžinti" : "✅ Įgyvendinta"}
                  </SubmitButton>
                </IdForm>
                <IdForm action={setIdeaStatus} id={i.id} extra={<input type="hidden" name="status" value="pending" />}>
                  <SubmitButton className="btn ghost small" pendingText="…">Paslėpti</SubmitButton>
                </IdForm>
                <IdForm action={deleteIdea} id={i.id}>
                  <SubmitButton className="btn danger small" pendingText="…">Ištrinti</SubmitButton>
                </IdForm>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
