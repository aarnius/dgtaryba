import { sql } from "@/lib/db";
import { icsCalendar } from "@/lib/ics";

export const dynamic = "force-dynamic";

// /renginiai/5 → vieno renginio .ics failas (Apple / Outlook kalendoriui)
export async function GET(_req, { params }) {
  const { id } = await params;
  const n = Number(String(id).replace(/\.ics$/, ""));
  const [e] = Number.isInteger(n) ? await sql`SELECT * FROM events WHERE id = ${n}` : [];
  if (!e) return new Response("Renginys nerastas", { status: 404 });
  return new Response(icsCalendar([e]), {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": `attachment; filename="renginys-${e.id}.ics"` },
  });
}
