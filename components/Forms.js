"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitIdea, askQuestion, login, saveBlock } from "@/app/actions";
import { KINDS, PLACES, COLORS } from "@/lib/blocks";

export function SubmitButton({ children, className = "btn", pendingText = "Siunčiama…", disabled = false, title }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} title={title} aria-label={title}>
      {pending ? pendingText : children}
    </button>
  );
}

export function ConfirmButton({ children, className = "btn", message = "Ar tikrai?", title }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit" className={className} disabled={pending} title={title} aria-label={title}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
    >
      {pending ? "…" : children}
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

// Puslapio redaktoriaus forma: naujam blokui arba esamo redagavimui
export function BlockForm({ block }) {
  const [state, action] = useActionState(saveBlock, null);
  const [kind, setKind] = useState(block?.kind ?? "button");
  const [color, setColor] = useState(block?.color ?? "mustard");
  const formRef = useRef(null);
  const def = KINDS[kind];
  const has = (f) => def.fields.includes(f);

  // Po sėkmingo pridėjimo išvalom laukus (tipą ir vietą paliekam)
  useEffect(() => {
    if (state?.ok && !block) {
      formRef.current?.querySelectorAll("input[type=text], input[type=url], textarea").forEach((el) => { el.value = ""; });
    }
  }, [state, block]);

  const labels = {
    button: { title: "Mygtuko tekstas", url: "Nuoroda" },
    banner: { title: "Skelbimo tekstas", url: "Nuoroda (nebūtina)" },
    heading: { title: "Antraštė" },
    text: { title: "Pavadinimas (nebūtina)", body: "Tekstas" },
    image: { url: "Nuotraukos adresas", title: "Parašas (nebūtina)" },
  }[kind];

  return (
    <form action={action} ref={formRef} className="card form" id="forma">
      <h3>{block ? "Redaguoti bloką" : "Pridėti bloką"}</h3>
      {block && <input type="hidden" name="id" value={block.id} />}

      <div className="field">
        <span>Tipas</span>
        <div className="kind-picker">
          {Object.entries(KINDS).map(([k, d]) => (
            <label key={k} className={`kind-opt ${kind === k ? "on" : ""}`}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
              <span className="e">{d.emoji}</span>{d.label}
            </label>
          ))}
        </div>
        <small className="muted">{def.hint}</small>
      </div>

      {has("title") && (
        <label className="field"><span>{labels.title}</span>
          <input type="text" name="title" defaultValue={block?.title ?? ""} maxLength={200}
            placeholder={kind === "button" ? "Pvz. Registruokis į talentų šou" : ""} />
        </label>
      )}
      {has("body") && (
        <label className="field"><span>{labels.body}</span>
          <textarea name="body" rows={5} defaultValue={block?.body ?? ""} maxLength={4000} />
        </label>
      )}
      {has("url") && (
        <label className="field"><span>{labels.url}</span>
          <input type="text" inputMode="url" name="url" defaultValue={block?.url ?? ""} maxLength={500}
            placeholder={kind === "image" ? "https://…/nuotrauka.jpg" : "https://… arba /renginiai"} />
        </label>
      )}
      {has("color") && (
        <div className="field">
          <span>Spalva</span>
          <div className="swatches">
            {Object.entries(COLORS).map(([c, name]) => (
              <label key={c} className={`swatch c-${c} ${color === c ? "on" : ""}`} title={name}>
                <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} />
                <span className="sr">{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="field"><span>Vieta pagrindiniame puslapyje</span>
        <select name="place" defaultValue={block?.place ?? "bottom"}>
          {Object.entries(PLACES).map(([p, name]) => <option key={p} value={p}>{name}</option>)}
        </select>
      </label>

      <div className="actions">
        <SubmitButton pendingText="Saugoma…">{block ? "Išsaugoti" : "Pridėti"}</SubmitButton>
        {block && <a href="/admin/puslapis" className="btn ghost">Atšaukti</a>}
      </div>
      <Feedback state={state} />
    </form>
  );
}
