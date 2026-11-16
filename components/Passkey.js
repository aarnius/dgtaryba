"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { passkeyLoginOptions, passkeyLogin, passkeyRegisterOptions, passkeyRegister } from "@/app/passkey-actions";

const toBuf = (s) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
};
const toB64url = (buf) => {
  if (!buf) return "";
  let s = "";
  for (const x of new Uint8Array(buf)) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export function usePasskeySupport() {
  const [ok, setOk] = useState(null);
  useEffect(() => { setOk(typeof window !== "undefined" && !!window.PublicKeyCredential && !!navigator.credentials); }, []);
  return ok;
}

function niceError(e) {
  if (e?.name === "NotAllowedError") return "Atšaukta arba baigėsi laikas.";
  if (e?.name === "InvalidStateError") return "Šiame įrenginyje passkey jau yra.";
  if (e?.name === "SecurityError") return "Passkey šiame adrese neveikia. Atsidaryk dgtaryba.lt.";
  return e?.message || "Nepavyko.";
}

/* ---------- Prisijungimas ---------- */

export function PasskeyLoginButton() {
  const router = useRouter();
  const supported = usePasskeySupport();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  if (supported === false) return null;

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const res = await passkeyLoginOptions();
      if (!res.ok) throw new Error(res.msg);
      const o = res.options;
      const cred = await navigator.credentials.get({
        publicKey: { challenge: toBuf(o.challenge), rpId: o.rpId, timeout: o.timeout, userVerification: o.userVerification, allowCredentials: [] },
      });
      const out = await passkeyLogin({
        id: toB64url(cred.rawId),
        clientDataJSON: toB64url(cred.response.clientDataJSON),
        authenticatorData: toB64url(cred.response.authenticatorData),
        signature: toB64url(cred.response.signature),
      });
      if (!out.ok) throw new Error(out.msg);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      console.error(e);
      setErr(niceError(e));
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn passkey" onClick={go} disabled={busy || !supported}>
        <span aria-hidden>🔑</span> {busy ? "Laukiama patvirtinimo…" : "Prisijungti su passkey"}
      </button>
      <small className="muted center">Pirštas, veidas arba kompiuterio PIN. Passkey susikursi prisijungęs.</small>
      {err && <p className="note err">{err}</p>}
    </>
  );
}

/* ---------- Pridėti passkey ---------- */

function guessName() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android telefonas";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows kompiuteris";
  return "Mano įrenginys";
}

export function AddPasskey() {
  const router = useRouter();
  const supported = usePasskeySupport();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { setName(guessName()); }, []);

  if (supported === false) return <p className="note err">Ši naršyklė passkey nepalaiko. Atnaujink ją arba naudok kitą.</p>;

  async function go(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await passkeyRegisterOptions();
      if (!res.ok) throw new Error(res.msg);
      const o = res.options;
      const cred = await navigator.credentials.create({
        publicKey: {
          ...o,
          challenge: toBuf(o.challenge),
          user: { ...o.user, id: toBuf(o.user.id) },
          excludeCredentials: o.excludeCredentials.map((c) => ({ ...c, id: toBuf(c.id) })),
        },
      });
      const r = cred.response;
      if (typeof r.getPublicKey !== "function") throw new Error("Naršyklė per sena passkey. Atnaujink ją.");
      const out = await passkeyRegister({
        id: cred.id,
        rawId: toB64url(cred.rawId),
        clientDataJSON: toB64url(r.clientDataJSON),
        authenticatorData: toB64url(r.getAuthenticatorData()),
        publicKey: toB64url(r.getPublicKey()),
        publicKeyAlgorithm: r.getPublicKeyAlgorithm(),
        transports: typeof r.getTransports === "function" ? r.getTransports() : [],
      }, name);
      setMsg(out);
      if (out.ok) router.refresh();
    } catch (err) {
      console.error(err);
      setMsg({ ok: false, msg: niceError(err) });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={go} className="form">
      <label className="field"><span>Pavadinimas (kad atskirtum įrenginius)</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </label>
      <button className="btn" disabled={busy || !supported}>{busy ? "Laukiama patvirtinimo…" : "🔑 Sukurti passkey šiam įrenginiui"}</button>
      {msg && <p className={`note ${msg.ok ? "ok" : "err"}`}>{msg.msg}</p>}
    </form>
  );
}
