import { votePoll } from "@/app/actions";
import { SubmitButton } from "./Forms";

// poll: { id, question, active, options: [{id,label,votes}], myOption }
export default function PollCard({ poll }) {
  const total = poll.options.reduce((s, o) => s + o.votes, 0);
  const showResults = poll.myOption != null || !poll.active;

  return (
    <div className="card poll tape">
      <div className="poll-head">
        <h3>{poll.question}</h3>
        {!poll.active && <span className="tag">Uždaryta</span>}
      </div>

      {showResults ? (
        <ul className="results">
          {poll.options.map((o) => {
            const pct = total ? Math.round((o.votes / total) * 100) : 0;
            return (
              <li key={o.id} className={o.id === poll.myOption ? "mine" : ""}>
                <div className="bar" style={{ width: `${pct}%` }} />
                <span className="label">{o.label}{o.id === poll.myOption && " ← tavo"}</span>
                <span className="pct">{pct}%</span>
              </li>
            );
          })}
          <li className="total muted small">Balsavo: {total}</li>
        </ul>
      ) : (
        <div className="options">
          {poll.options.map((o) => (
            <form key={o.id} action={votePoll}>
              <input type="hidden" name="poll" value={poll.id} />
              <input type="hidden" name="option" value={o.id} />
              <SubmitButton className="option" pendingText="…">{o.label}</SubmitButton>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
