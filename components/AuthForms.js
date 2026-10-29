"use client";

import { useActionState, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { signInEmail, signUpEmail, verifyCode, resendCode } from "@/app/actions";
import { SubmitButton, Feedback } from "./Forms";

function GoogleButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const origin = window.location.origin;
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${origin}/admin`,
        errorCallbackURL: `${origin}/prisijungti?klaida=google`,
      });
      if (res?.error) throw new Error(res.error.message);
    } catch (e) {
      console.error(e);
      setErr("Nepavyko prisijungti su Google. Bandyk dar kartą.");
      setBusy(false);
    }
  }
  return (
    <>
      <button type="button" className="btn google" onClick={go} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        {busy ? "Jungiamasi…" : "Prisijungti su Google"}
      </button>
      {err && <p className="note err">{err}</p>}
    </>
  );
}

export function LoginPanel({ error }) {
  const [mode, setMode] = useState("in");
  const [inState, inAction] = useActionState(signInEmail, null);
  const [upState, upAction] = useActionState(signUpEmail, null);

  return (
    <div className="card form narrow auth-card">
      <h3>Tarybos zona</h3>
      {error && <p className="note err">{error}</p>}
      <GoogleButton />
      <div className="or"><span>arba su el. paštu</span></div>

      <div className="seg" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>Prisijungti</button>
        <button type="button" role="tab" aria-selected={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>Registruotis</button>
      </div>

      {mode === "in" ? (
        <form action={inAction} className="form">
          <label className="field"><span>El. paštas</span><input name="email" type="email" autoComplete="email" required /></label>
          <label className="field"><span>Slaptažodis</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <SubmitButton pendingText="Jungiamasi…">Prisijungti</SubmitButton>
          <Feedback state={inState} />
        </form>
      ) : (
        <form action={upAction} className="form">
          <label className="field"><span>Vardas</span><input name="name" autoComplete="name" maxLength={80} /></label>
          <label className="field"><span>El. paštas</span><input name="email" type="email" autoComplete="email" required /></label>
          <label className="field"><span>Slaptažodis</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <small className="muted">Atsiųsime kodą el. paštu, kad patvirtintum adresą.</small>
          <SubmitButton pendingText="Kuriama…">Sukurti paskyrą</SubmitButton>
          <Feedback state={upState} />
        </form>
      )}
    </div>
  );
}

export function VerifyPanel({ email }) {
  const [state, action] = useActionState(verifyCode, null);
  const [resent, resend] = useActionState(resendCode, null);
  return (
    <div className="card form narrow auth-card">
      <h3>Patvirtink el. paštą</h3>
      <p className="muted small" style={{ margin: 0 }}>
        Išsiuntėme kodą į <strong style={{ color: "var(--text)" }}>{email}</strong>. Jei nerandi, pažiūrėk „Spam“ aplanke.
      </p>
      <form action={action} className="form">
        <label className="field"><span>Kodas</span>
          <input name="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={10} required className="mono otp" />
        </label>
        <SubmitButton pendingText="Tikrinama…">Patvirtinti</SubmitButton>
        <Feedback state={state} />
      </form>
      <form action={resend}>
        <SubmitButton className="btn ghost small" pendingText="Siunčiama…">Siųsti kodą dar kartą</SubmitButton>
      </form>
      <Feedback state={resent?.msg ? resent : null} />
    </div>
  );
}
