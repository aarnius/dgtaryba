import { sql } from "@/lib/db";
import { icsCalendar } from "@/lib/ics";

export const dynamic = "force-dynamic";

// Visų renginių kalendorius (galima prenumeruoti telefone)
export async function GET() {
  const events = await sql`SELECT * FROM events WHERE starts_at > now() - interval '60 days' ORDER BY starts_at`;
  return new Response(icsCalendar(events), {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "public, max-age=900", "content-disposition": 'inline; filename="dgtaryba-renginiai.ics"' },
  });
}
