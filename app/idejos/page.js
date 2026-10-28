import Ransom from "@/components/Ransom";
import { getVoter } from "@/lib/session";
import { getIdeas } from "@/lib/queries";
import { toggleIdeaVote } from "@/app/actions";
import { timeAgo } from "@/lib/format";
import { IdeaForm } from "@/components/Forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Idėjos" };

export default async function IdeasPage() {
  const ideas = await getIdeas(await getVoter());

  return (
    <>
      <div className="page-head">
        <Ransom text="Idėjų dėžutė" seed={11} />
        <p className="muted">Spausk ♥ prie idėjų, kurios tau patinka. Populiariausias taryba svarsto pirmiausia.</p>
      </div>

      <div className="two-col">
        <div className="idea-list">
          {ideas.length === 0 && (
            <div className="card empty"><span className="big">📭</span>Dar nėra idėjų. Parašyk pirmą!</div>
          )}
          {ideas.map((idea) => (
            <article key={idea.id} className={`card idea ${idea.status === "done" ? "done" : ""}`}>
              <form action={toggleIdeaVote}>
                <input type="hidden" name="id" value={idea.id} />
                <button className={`vote ${idea.voted ? "on" : ""}`} aria-label={idea.voted ? "Atšaukti balsą" : "Balsuoti"}>
                  <span className="heart">{idea.voted ? "♥" : "♡"}</span>
                  {idea.votes}
                </button>
              </form>
              <div className="idea-body">
                <h3>{idea.title}</h3>
                {idea.body && <p>{idea.body}</p>}
                <span className="muted small">
                  {idea.author ? `${idea.author} · ` : ""}{timeAgo(idea.created_at)}
                </span>{" "}
                {idea.status === "done" && <span className="tag done">✅ Įgyvendinta</span>}
              </div>
            </article>
          ))}
        </div>

        <aside className="sticky">
          <IdeaForm />
        </aside>
      </div>
    </>
  );
}
