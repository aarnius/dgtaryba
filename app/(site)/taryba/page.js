import Ransom from "@/components/Ransom";
import { getCouncil, getDecisions, getTimeline } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mokinių taryba: nariai ir veikla",
  description: "Kas yra Dariaus ir Girėno gimnazijos mokinių taryboje, ką jau nuveikėme ir kokius sprendimus priėmėme.",
  alternates: { canonical: "/taryba" },
};

const dateFmt = new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Vilnius" });
const fmtDay = (d) => dateFmt.format(new Date(d));
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default async function CouncilPage() {
  const [members, timeline, decisions] = await Promise.all([getCouncil(), getTimeline(40), getDecisions(40)]);

  return (
    <>
      <div className="page-head">
        <Ransom text="Mūsų taryba" seed={81} />
        <p className="muted">Žmonės, kurie stengiasi, kad mokykloje būtų geriau. Drąsiai kreipkis!</p>
      </div>

      <section className="section">
        <h2>Nariai <span className="tag">{members.length}</span></h2>
        {members.length === 0 ? (
          <div className="card empty"><span className="big">🙋</span>Narių sąrašas netrukus</div>
        ) : (
          <div className="member-grid">
            {members.map((m) => (
              <article key={m.id} className="card person">
                <div className="avatar xl">{m.photo_url ? <img src={m.photo_url} alt={m.name} loading="lazy" /> : <span>{initials(m.name)}</span>}</div>
                <h3>{m.name}</h3>
                <div className="person-meta">
                  {m.role && <span className="tag role">{m.role}</span>}
                  {m.class_name && <span className="muted small">{m.class_name} kl.</span>}
                </div>
                {m.bio && <p className="small">{m.bio}</p>}
                {m.contact && <p className="small muted contact">{m.contact}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="two-equal">
        <section className="section">
          <h2>Nuveikta</h2>
          {timeline.length === 0 ? (
            <div className="card empty small">Čia atsiras tai, ką padarėme</div>
          ) : (
            <ol className="timeline">
              {timeline.map((t) => (
                <li key={t.key}>
                  <span className="dot" aria-hidden>{t.emoji}</span>
                  <div className="card">
                    <div className="muted small">{fmtDay(t.day)}{t.kind === "idea" && " · mokinių idėja"}</div>
                    <h3>{t.title}</h3>
                    {t.body && <p>{t.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="section">
          <h2>Sprendimai</h2>
          {decisions.length === 0 ? (
            <div className="card empty small">Sprendimų dar nėra</div>
          ) : (
            <div className="card decisions">
              {decisions.map((d) => (
                <article key={d.id} className="decision">
                  <div className="muted small mono">{fmtDay(d.decided_on)}</div>
                  <h3>✔︎ {d.title}</h3>
                  {d.body && <p>{d.body}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
