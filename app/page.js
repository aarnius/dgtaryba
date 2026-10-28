import Link from "next/link";
import { getVoter } from "@/lib/session";
import { getIdeas, getPolls, getUpcomingEvents } from "@/lib/queries";
import { formatDateTime, daysUntil } from "@/lib/format";
import PollCard from "@/components/PollCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const voter = await getVoter();
  const [ideas, polls, events] = await Promise.all([
    getIdeas(voter, { limit: 3 }),
    getPolls(voter, { activeOnly: true }),
    getUpcomingEvents(1),
  ]);
  const next = events[0];
  const poll = polls[0];

  return (
    <>
      <section className="hero">
        <img src="/koliazas.jpg" alt="Mokinių taryba" className="hero-photo" width={2546} height={1400} />
        <p className="hero-text muted">
          Siūlyk idėjas, balsuok, klausk drąsiai ir nepraleisk nė vieno renginio.
        </p>
      </section>

      <div className="tiles">
        <Link href="/idejos" className="tile c1"><span className="emoji">💡</span><strong>Idėjos</strong><span>Pasiūlyk, kaip pagerinti mokyklą</span></Link>
        <Link href="/apklausos" className="tile c2"><span className="emoji">📊</span><strong>Apklausos</strong><span>Nuspręsk kartu su visais</span></Link>
        <Link href="/renginiai" className="tile c3"><span className="emoji">📅</span><strong>Renginiai</strong><span>Kas vyksta artimiausiu metu</span></Link>
        <Link href="/klausimai" className="tile c4"><span className="emoji">💬</span><strong>Klausimai</strong><span>Klausk anonimiškai</span></Link>
      </div>

      <div className="home-grid">
        <section>
          <h2>Kitas renginys</h2>
          {next ? (
            <div className="card tape tilt-l">
              <div style={{ fontSize: "2.4rem" }}>{next.emoji}</div>
              <h3>{next.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{formatDateTime(next.starts_at)}{next.location && ` · ${next.location}`}</p>
              <p className="countdown" style={{ margin: "8px 0 0" }}>{daysUntil(next.starts_at)}</p>
            </div>
          ) : (
            <div className="card empty"><span className="big">🗓️</span>Renginių kol kas nėra</div>
          )}
          <p><Link href="/renginiai" className="section-link">Visi renginiai →</Link></p>
        </section>

        <section>
          <h2>Populiariausios idėjos</h2>
          <div className="card tape tilt-r">
            {ideas.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Kol kas tuščia. Būk pirmas! 🚀</p>
            ) : (
              ideas.map((idea, i) => (
                <p key={idea.id} style={{ margin: "6px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span className="medal">{["🥇", "🥈", "🥉"][i]}</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{idea.title}</span>
                  <span className="tag">♥ {idea.votes}</span>
                </p>
              ))
            )}
          </div>
          <p><Link href="/idejos" className="section-link">Siūlyti idėją →</Link></p>
        </section>

        {poll && (
          <section>
            <h2>Balsuok dabar</h2>
            <PollCard poll={poll} />
            <p><Link href="/apklausos" className="section-link">Visos apklausos →</Link></p>
          </section>
        )}
      </div>
    </>
  );
}
