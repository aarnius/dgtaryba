import Link from "next/link";
import { getVoter } from "@/lib/session";
import { getIdeas, getPolls, getUpcomingEvents, getStats, getBlocks } from "@/lib/queries";
import { getCurrentUser, can } from "@/lib/session";
import Blocks from "@/components/Blocks";
import BellWidget from "@/components/BellWidget";
import VideoEmbed from "@/components/VideoEmbed";
import PushButton from "@/components/PushButton";
import { getBells, getVideos } from "@/lib/content";
import { formatEventWhen, eventOngoing, countdownParts } from "@/lib/format";
import PollCard from "@/components/PollCard";
import { SITE_URL, SITE_NAME, SCHOOL, SCHOOL_GEN, SITE_DESCRIPTION } from "@/lib/site";

export const dynamic = "force-dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#taryba`,
      name: SITE_NAME,
      alternateName: ["DG mokinių taryba", "Dariaus ir Girėno gimnazijos mokinių taryba", "dgtaryba"],
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      image: `${SITE_URL}/koliazas.jpg`,
      parentOrganization: { "@type": "HighSchool", name: SCHOOL, address: { "@type": "PostalAddress", addressLocality: "Kaunas", addressCountry: "LT" } },
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: SITE_NAME, inLanguage: "lt", publisher: { "@id": `${SITE_URL}/#taryba` } },
  ],
};

export default async function Home() {
  const voter = await getVoter();
  const [ideas, polls, events, stats, blocks, user, bells, videos] = await Promise.all([
    getIdeas(voter, { limit: 6 }),
    getPolls(voter, { activeOnly: true }),
    getUpcomingEvents(1),
    getStats(),
    getBlocks(),
    getCurrentUser(),
    getBells(),
    getVideos(3),
  ]);
  const next = events[0];
  const poll = polls[0];
  const cd = next && countdownParts(next.starts_at);
  const nextOn = next && eventOngoing(next);
  const topIdeas = ideas.filter((i) => i.status !== "done").slice(0, 4);

  return (
    <>
      <Blocks blocks={blocks.filter((b) => b.place === "top")} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="home-title">
        <h1>{SCHOOL_GEN} <span>mokinių taryba</span></h1>
        <p className="muted">Siūlyk idėjas, balsuok apklausose, sek renginius bei įvykius ir klausk tarybos anonimiškai.</p>
        <div style={{ marginTop: 10 }}><PushButton /></div>
      </header>

      <section className="hero">
        <img src="/koliazas.jpg" alt="Dariaus ir Girėno gimnazijos mokinių taryba: renginiai ir susitikimai" className="hero-photo" width={2546} height={1400} />

        <div className="hero-side">
          <BellWidget bells={bells} />
          <div className="card timer">
            <h3>{nextOn ? "Dabar vyksta" : "Iki kito renginio / įvykio"}</h3>
            {next ? (
              <>
                {nextOn ? (
                  <div className="digits live">🔴 Vyksta!</div>
                ) : (
                  <div className="digits">
                    {cd.d}<small>d</small>{cd.h}<small>h</small>{cd.m}<small>m</small>
                  </div>
                )}
                <div>
                  <strong>{next.emoji} {next.title}</strong>
                  <div className="muted small">{formatEventWhen(next)}</div>
                </div>
              </>
            ) : (
              <p className="muted" style={{ margin: 0 }}>Renginių ir įvykių kol kas nėra</p>
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
          <span className="emoji">📅</span>Renginiai / Įvykiai<span className="count">{stats.events}</span>
        </Link>
        <Link href="/klausimai" className="tile c4">
          <span className="emoji">💬</span>Klausimai<span className="count">{stats.answered}</span>
        </Link>
      </nav>

      <Blocks blocks={blocks.filter((b) => b.place === "bottom")} />

      {videos.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Naujausi video</h2>
            <a href="/galerija" className="section-link">Visa galerija →</a>
          </div>
          <div className="video-row">{videos.map((v) => <VideoEmbed key={v.id} v={v} />)}</div>
        </section>
      )}

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
