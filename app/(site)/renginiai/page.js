import Ransom from "@/components/Ransom";
import { getUpcomingEvents } from "@/lib/queries";
import { eventChip, formatEventWhen, eventCountdown } from "@/lib/format";
import { googleCalendarUrl } from "@/lib/ics";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Renginiai / Įvykiai", description: "Artėjantys Dariaus ir Girėno gimnazijos renginiai ir įvykiai: diskotekos, šou, akcijos, išvykos ir kt.", alternates: { canonical: "/renginiai" } };

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <div className="page-head">
        <Ransom text="Renginiai / Įvykiai" seed={31} />
        <p className="muted">Viskas, kas vyks artimiausiu metu. Pasižymėk kalendoriuje!</p>
        <div className="actions" style={{ marginTop: 12 }}>
          <a className="btn ghost small" href={`webcal://${SITE_URL.replace(/^https?:\/\//, "")}/renginiai.ics`}>📆 Prenumeruoti kalendorių</a>
          <a className="btn ghost small" href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${SITE_URL.replace(/^https?:\/\//, "")}/renginiai.ics`)}`} target="_blank" rel="noopener noreferrer">+ Google kalendorius</a>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="card empty"><span className="big">😴</span>Kol kas ramu. Netrukus kažkas bus!</div>
      ) : (
        <div className="events">
          {events.map((e) => {
            const chip = eventChip(e);
            return (
            <article key={e.id} className="card event">
              <div className={`date-chip${chip.wide ? " wide" : ""}`}>
                <span className="m">{chip.m}</span>
                <span className="d">{chip.d}</span>
              </div>
              <div className="event-info">
                <h3>{e.emoji} {e.title}</h3>
                <p className="muted small">{formatEventWhen(e)}{e.location && ` · 📍 ${e.location}`}</p>
                {e.description && <p>{e.description}</p>}
                <div className="cal-links">
                  <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer">+ Google</a>
                  <a href={`/renginiai/${e.id}`}>+ Apple / Outlook</a>
                </div>
              </div>
              <span className="countdown">{eventCountdown(e)}</span>
            </article>
            );
          })}
        </div>
      )}
    </>
  );
}
