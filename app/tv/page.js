import QRCode from "qrcode";
import TvScreen from "@/components/TvScreen";
import { getTv } from "@/lib/tv";
import { getBells } from "@/lib/content";
import { getIdeas, getPolls, getUpcomingEvents } from "@/lib/queries";
import { sql } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// Kešuojama 5 min.: kiek televizorių bebūtų, duomenų bazė užklausiama retai.
// Pakeitimai redaktoriuje atnaujina ekraną iškart (revalidatePath).
export const revalidate = 300;
export const metadata = { title: "TV ekranas", robots: { index: false } };

export default async function TvPage() {
  const [tv, bells, events, ideas, polls, photos] = await Promise.all([
    getTv(), getBells(), getUpcomingEvents(5), getIdeas(null, { limit: 8 }), getPolls(null, { activeOnly: true }),
    sql`SELECT url FROM photos ORDER BY id DESC LIMIT 9`,
  ]);
  const banners = await sql`SELECT title FROM blocks WHERE kind = 'banner' AND visible ORDER BY place, position`;
  const qr = await QRCode.toString(SITE_URL, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#140e18", light: "#00000000" } });

  return (
    <TvScreen
      tv={tv}
      bells={bells}
      events={events.map((e) => ({ id: e.id, title: e.title, emoji: e.emoji, location: e.location, starts_at: new Date(e.starts_at).toISOString() }))}
      ideas={ideas.filter((i) => i.status !== "done").slice(0, 5).map((i) => ({ id: i.id, title: i.title, votes: i.votes }))}
      poll={polls[0] ? { question: polls[0].question, options: polls[0].options.map((o) => ({ id: o.id, label: o.label, votes: o.votes })) } : null}
      photos={photos.map((p) => p.url)}
      ticker={[...banners.map((b) => b.title), ...tv.ticker]}
      qrSvg={qr}
    />
  );
}
