import Link from "next/link";
import { getVoter } from "@/lib/session";
import { getIdeas, getPolls, getUpcomingEvents, getStats, getBlocks } from "@/lib/queries";
import { getCurrentUser, can } from "@/lib/session";
import Blocks from "@/components/Blocks";
import { formatDateTime, countdownParts } from "@/lib/format";
import PollCard from "@/components/PollCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const voter = await getVoter();
  const [ideas, polls, events, stats, blocks, user] = await Promise.all([
    getIdeas(voter, { limit: 6 }),
    getPolls(voter, { activeOnly: true }),
    getUpcomingEvents(1),
    getStats(),
    getBlocks(),
    getCurrentUser(),
  ]);
  const next = events[0];
  const poll = polls[0];
  const cd = next && countdownParts(next.starts_at);
  const topIdeas = ideas.filter((i) => i.status !== "done").slice(0, 4);

  return (
    <>
      <Blocks blocks={blocks.filter((b) => b.place === "top")} />

      <section className="hero">
        <img src="/koliazas.jpg" alt="Mokinių taryba" className="hero-photo" width={2546} height={1400} />

        <div className="hero-side">
          <div className="card timer">
            <h3>Iki kito renginio</h3>
            {next ? (
              <>
                <div className="digits">
                  {cd.d}<small>d</small>{cd.h}<small>h</small>{cd.m}<small>m</small>
                </div>
                <div>
                  <strong>{next.emoji} {next.title}</strong>
                  <div className="muted small">{formatDateTime(next.starts_at)}</div>
                </div>
              </>
            ) : (
              <p className="muted" style={{ margin: 0 }}>Renginių kol kas nėra</p>
            )}
          </div>
          <div className="stat-row">
            <div className="card stat"><b>{stats.votes}</b><span>Balsų</span></div>
            <div className="card stat"><b>{stats.done}</b><span>Įgyvendinta</span></div>
          </div>
        </div>
      </section>

      <nav className="tiles" aria-label="Skiltys">
        <Link href="/idejos" className="tile c1">
          <span className="emoji">💡</span>Idėjos<span className="count">{stats.ideas}</span>
        </Link>
        <Link href="/apklausos" className="tile c2">
          <span className="emoji">📊</span>Apklausos<span className="count">{stats.polls}</span>
        </Link>
        <Link href="/renginiai" className="tile c3">
          <span className="emoji">📅</span>Renginiai<span className="count">{stats.events}</span>
        </Link>
        <Link href="/klausimai" className="tile c4">
          <span className="emoji">💬</span>Klausimai<span className="count">{stats.answered}</span>
        </Link>
      </nav>

      <Blocks blocks={blocks.filter((b) => b.place === "bottom")} />

      <div className="home-grid">
        <section>
          <h2>Populiariausios idėjos</h2>
          <div className="card">
            {topIdeas.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Kol kas tuščia. Būk pirmas! 🚀</p>
            ) : (
              <ol className="rank">
                {topIdeas.map((idea, i) => (
                  <li key={idea.id}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="t">{idea.title}</span>
                    <span className="v">♥ {idea.votes}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <Link href="/idejos" className="section-link">Siūlyti idėją →</Link>
        </section>

        {poll && (
          <section>
            <h2>Balsuok dabar</h2>
            <PollCard poll={poll} />
            <Link href="/apklausos" className="section-link">Visos apklausos →</Link>
          </section>
        )}
      </div>

      {can(user, "page") && <a href="/admin/puslapis" className="edit-fab">✏️ Redaguoti puslapį</a>}
    </>
  );
}
