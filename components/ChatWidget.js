"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chatPoll, chatSend, chatMarkRead } from "@/app/chat-actions";

const time = (d) => new Date(d).toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vilnius" });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const listRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const { thread, messages } = await chatPoll(lastId.current);
      if (messages.length) {
        lastId.current = messages[messages.length - 1].id;
        setMsgs((m) => [...m, ...messages.filter((x) => !m.some((y) => y.id === x.id))]);
      }
      setUnread(thread?.unread ?? 0);
    } catch {}
  }, []);

  // Atidarius: dažniau; uždarius: retai, tik dėl naujų atsakymų ženkliuko
  useEffect(() => {
    poll();
    const every = open ? 3500 : 25000;
    const t = setInterval(() => { if (document.visibilityState === "visible") poll(); }, every);
    return () => clearInterval(t);
  }, [open, poll]);

  useEffect(() => {
    if (open && unread) { chatMarkRead(); setUnread(0); }
  }, [open, unread]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  async function send(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setErr(null);
    const res = await chatSend(body, name).catch(() => ({ ok: false, msg: "Nepavyko išsiųsti" }));
    setSending(false);
    if (!res.ok) return setErr(res.msg);
    setText("");
    poll();
  }

  return (
    <>
      <button type="button" className={`chat-fab ${open ? "on" : ""}`} onClick={() => setOpen((o) => !o)} aria-label={open ? "Uždaryti pokalbį" : "Rašyti tarybai"}>
        {open ? "✕" : "💬"}
        {!open && unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Pokalbis su taryba">
          <div className="chat-head">
            <strong>Rašyk tarybai</strong>
            <span className="muted small">Atsakysime kuo greičiau. Gali rašyti anonimiškai.</span>
          </div>
          <div className="chat-list" ref={listRef}>
            {msgs.length === 0 && (
              <div className="chat-empty">
                <span>👋</span>
                <p>Labas! Klausk, siūlyk ar pasidalink. Žinutes mato tik taryba.</p>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={`msg ${m.admin ? "them" : "me"}`}>
                {m.admin && <span className="msg-author">{m.author || "Taryba"}</span>}
                <p>{m.body}</p>
                <time>{time(m.at)}</time>
              </div>
            ))}
          </div>
          <form className="chat-form" onSubmit={send}>
            {msgs.length === 0 && (
              <input className="chat-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Vardas, klasė (nebūtina)" />
            )}
            <div className="chat-row">
              <textarea
                value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={1000} placeholder="Rašyk žinutę…"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }}
              />
              <button type="submit" className="btn" disabled={sending || !text.trim()} aria-label="Siųsti">➤</button>
            </div>
            {err && <p className="note err">{err}</p>}
          </form>
        </div>
      )}
    </>
  );
}
