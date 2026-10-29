"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitIdea, askQuestion, saveBlock, saveMember } from "@/app/actions";
import { PERMS } from "@/lib/perms";
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

export function Feedback({ state }) {
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

// Nario pridėjimas (be `member`) arba jo teisių keitimas (su `member`)
export function MemberForm({ member, canGrantMembers }) {
  const [state, action] = useActionState(saveMember, null);
  const formRef = useRef(null);
  useEffect(() => {
    if (state?.ok && !member) formRef.current?.reset();
  }, [state, member]);
  const has = (p) => member?.perms?.includes(p);

  return (
    <form action={action} ref={formRef} className={member ? "form member-form" : "card form"}>
      {!member && <h3>Pridėti narį</h3>}
      {member ? (
        <input type="hidden" name="email" value={member.email} />
      ) : (
        <>
          <label className="field"><span>El. paštas</span><input name="email" type="email" required placeholder="vardas@dgg.lt" /></label>
          <label className="field"><span>Vardas (nebūtina)</span><input name="name" maxLength={80} /></label>
        </>
      )}
      <div className="field">
        {!member && <span>Teisės</span>}
        <div className="perm-grid">
          {Object.entries(PERMS).map(([p, d]) => {
            const disabled = p === "members" && !canGrantMembers;
            return (
              <label key={p} className={`perm ${disabled ? "disabled" : ""}`} title={disabled ? "Šią teisę gali duoti tik savininkas" : d.hint}>
                <input type="checkbox" name="perm" value={p} defaultChecked={has(p)} disabled={disabled} />
                <span>{d.label}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="actions">
        <SubmitButton className={member ? "btn small" : "btn"} pendingText="Saugoma…">{member ? "Išsaugoti" : "Pridėti"}</SubmitButton>
        {state?.msg && <span className={state.ok ? "ok-inline" : "err-inline"}>{state.msg}</span>}
      </div>
    </form>
  );
}
