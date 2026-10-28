"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitIdea, askQuestion, login } from "@/app/actions";

export function SubmitButton({ children, className = "btn", pendingText = "Siunčiama…" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

function Feedback({ state }) {
  if (!state) return null;
  return <p className={state.ok ? "note ok" : "note err"}>{state.msg}</p>;
}

export function IdeaForm() {
  const [state, action] = useActionState(submitIdea, null);
  return (
    <form action={action} className="card form">
      <h3>Nauja idėja</h3>
      <label className="field"><span>Pavadinimas</span><input name="title" placeholder="Pvz. Mikrobangė valgykloje" maxLength={120} required /></label>
      <label className="field"><span>Aprašymas</span><textarea name="body" placeholder="Papasakok plačiau (nebūtina)" rows={3} maxLength={1000} /></label>
      <label className="field"><span>Autorius</span><input name="author" placeholder="Vardas ir klasė (nebūtina)" maxLength={60} /></label>
      <SubmitButton>Siųsti idėją</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}

export function QuestionForm() {
  const [state, action] = useActionState(askQuestion, null);
  return (
    <form action={action} className="card form">
      <h3>Anoniminis klausimas</h3>
      <p className="muted small" style={{ margin: 0 }}>Nesaugome nei vardo, nei el. pašto. Taryba atsakys viešai.</p>
      <label className="field"><span>Klausimas</span><textarea name="body" placeholder="Kodėl…? Ar galima…? Kada…?" rows={4} maxLength={600} required /></label>
      <SubmitButton>Siųsti klausimą</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="card form narrow">
      <h3>Tarybos zona</h3>
      <input name="password" type="password" placeholder="Slaptažodis" required autoFocus />
      <SubmitButton pendingText="Tikrinama…">Prisijungti</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}
