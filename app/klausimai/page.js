import Ransom from "@/components/Ransom";
import { getAnsweredQuestions } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { QuestionForm } from "@/components/Forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Klausimai" };

export default async function QuestionsPage() {
  const questions = await getAnsweredQuestions();

  return (
    <>
      <div className="page-head">
        <Ransom text="Klausk tarybos" seed={41} />
        <p className="muted">Anonimiškai. Čia rodomi tik tie klausimai, į kuriuos taryba jau atsakė.</p>
      </div>

      <div className="two-col">
        <div className="qa">
          {questions.length === 0 && (
            <div className="card empty"><span className="big">🤫</span>Atsakytų klausimų dar nėra</div>
          )}
          {questions.map((q) => (
            <article key={q.id} className="card">
              <div className="bubble-q">❓ {q.body}</div>
              <div className="bubble-a">
                <strong>Taryba atsako · {timeAgo(q.answered_at)}</strong>
                {q.answer}
              </div>
            </article>
          ))}
        </div>

        <aside className="sticky">
          <QuestionForm />
        </aside>
      </div>
    </>
  );
}
