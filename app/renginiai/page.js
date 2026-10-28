import Ransom from "@/components/Ransom";
import { getUpcomingEvents } from "@/lib/queries";
import { formatDay, formatMonth, formatDateTime, daysUntil } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Renginiai" };

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <div className="page-head">
        <Ransom text="Renginiai" seed={31} />
        <p className="muted">Viskas, kas vyks artimiausiu metu. Pasižymėk kalendoriuje!</p>
      </div>

      {events.length === 0 ? (
        <div className="card empty"><span className="big">😴</span>Kol kas ramu. Netrukus kažkas bus!</div>
      ) : (
        <div className="events">
          {events.map((e, i) => (
            <article key={e.id} className={`card event ${i % 2 ? "tilt-r" : "tilt-l"}`}>
              <div className="date-chip">
                <span className="m">{formatMonth(e.starts_at)}</span>
                <span className="d">{formatDay(e.starts_at)}</span>
              </div>
              <div className="event-info">
                <h3>{e.emoji} {e.title}</h3>
                <p className="muted small">{formatDateTime(e.starts_at)}{e.location && ` · 📍 ${e.location}`}</p>
                {e.description && <p>{e.description}</p>}
              </div>
              <span className="countdown">{daysUntil(e.starts_at)}</span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
