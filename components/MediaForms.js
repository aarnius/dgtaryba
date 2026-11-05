"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton, Feedback } from "./Forms";
import { resizeImage } from "@/lib/resize";
import { uploadPhoto, finishUpload } from "@/app/content-actions";

// Bendra admin forma: po sėkmės išvalo laukus
export function ActionForm({ action, children, className = "card form", submit = "Išsaugoti", title }) {
  const [state, run] = useActionState(action, null);
  const ref = useRef(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form action={run} ref={ref} className={className}>
      {title && <h3>{title}</h3>}
      {children}
      <SubmitButton pendingText="Saugoma…">{submit}</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}

// Vienos nuotraukos laukas su peržiūra; prieš siunčiant sumažina
export function ImageField({ name = "photo", current, label = "Nuotrauka" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(current || null);
  const [removed, setRemoved] = useState(false);

  async function onChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file } = await resizeImage(f, 800, 0.85);
    const dt = new DataTransfer();
    dt.items.add(file);
    inputRef.current.files = dt.files;
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className="image-field">
        <div className="avatar lg">{preview ? <img src={preview} alt="" /> : <span>📷</span>}</div>
        <div className="image-field-actions">
          <label className="btn ghost small">
            {preview ? "Pakeisti" : "Pasirinkti"}
            <input ref={inputRef} type="file" name={name} accept="image/*" onChange={onChange} hidden />
          </label>
          {current && preview && (
            <button type="button" className="btn danger small" onClick={() => { setPreview(null); setRemoved(true); if (inputRef.current) inputRef.current.value = ""; }}>
              Pašalinti
            </button>
          )}
        </div>
      </div>
      {removed && <input type="hidden" name="remove_photo" value="1" />}
    </div>
  );
}

// Kelių nuotraukų įkėlimas į albumą su progresu
export function PhotoUploader({ albumId }) {
  const router = useRouter();
  const [state, setState] = useState(null); // { done, total, errors }

  async function onPick(e) {
    const files = [...(e.target.files ?? [])].filter((f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name));
    e.target.value = "";
    if (!files.length) return;
    const s = { done: 0, total: files.length, errors: [] };
    setState({ ...s });
    for (const f of files) {
      const { file, w, h } = await resizeImage(f);
      const fd = new FormData();
      fd.append("photo", file);
      if (w) { fd.append("w", w); fd.append("h", h); }
      const res = await uploadPhoto(albumId, fd).catch((err) => ({ ok: false, msg: err?.message }));
      s.done++;
      if (!res?.ok) s.errors.push(`${f.name}: ${res?.msg ?? "nepavyko"}`);
      setState({ ...s, errors: [...s.errors] });
    }
    await finishUpload();
    router.refresh();
  }

  const busy = state && state.done < state.total;
  return (
    <div className="uploader">
      <label className={`drop ${busy ? "busy" : ""}`}>
        <input type="file" accept="image/*" multiple onChange={onPick} disabled={busy} hidden />
        <span className="big">📸</span>
        <strong>{busy ? `Įkeliama ${state.done} / ${state.total}…` : "Pasirink nuotraukas"}</strong>
        <span className="muted small">Gali pasirinkti kelias iš karto. Jos bus sumažintos automatiškai.</span>
        <span className="muted small">⚠️ Kelk tik tas nuotraukas, kuriose esantys mokiniai (ar jų tėvai) sutiko su viešinimu pagal gimnazijos tvarką.</span>
        {busy && <span className="bell-bar"><span style={{ width: `${(state.done / state.total) * 100}%` }} /></span>}
      </label>
      {state && !busy && !state.errors.length && <p className="note ok">Įkelta {state.total} nuotr. ✓</p>}
      {state?.errors?.length > 0 && <p className="note err">{state.errors.join(" · ")}</p>}
    </div>
  );
}
