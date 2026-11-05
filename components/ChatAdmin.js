"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminThreads, adminThread, adminReply, adminSetThreadStatus, adminDeleteThread } from "@/app/chat-actions";

const when = (d) => {
  const x = new Date(d), now = new Date();
  const opt = x.toDateString() === now.toDateString() ? { hour: "2-digit", minute: "2-digit" } : { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return x.toLocaleString("lt-LT", { ...opt, timeZone: "Europe/Vilnius" });
};

export default function ChatAdmin({ initialThreads }) {
  const [threads, setThreads] = useState(initialThreads);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const lastId = useRef(0);
  const listRef = useRef(null);

  const loadThreads = useCallback(async () => { try { setThreads(await adminThreads()); } catch {} }, []);
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && loadThreads(), 6000);
    return () => clearInterval(t);
  }, [loadThreads]);

  const loadMsgs = useCallback(async (id, reset) => {
    if (reset) { lastId.current = 0; setMsgs([]); }
    try {
      const rows = await adminThread(id, lastId.current);
      if (rows.length) {
        lastId.current = rows[rows.length - 1].id;
        setMsgs((m) => (reset ? rows : [...m, ...rows.filter((r) => !m.some((x) => x.id === r.id))]));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMsgs(active, true);
    const t = setInterval(() => document.visibilityState === "visible" && loadMsgs(active), 3000);
    return () => clearInterval(t);
  }, [active, loadMsgs]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [msgs]);

  async function reply(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    await adminReply(active, body);
    loadMsgs(active);
    loadThreads();
  }

  const cur = threads.find((t) => t.id === active);

  return (
    <div className="chat-admin">
      <div className="card thread-list">
        {threads.length === 0 && <p className="muted" style={{ margin: 0 }}>Pokalbių dar nėra. Kai mokinys parašys, jis atsiras čia.</p>}
        {threads.map((t) => (
          <button key={t.id} type="button" className={`thread ${t.id === active ? "on" : ""} ${t.status}`} onClick={() => setActive(t.id)}>
            <span className="thread-top">
              <strong>{t.name || `Anonimas #${t.id}`}</strong>
              <time className="muted small">{when(t.last_at)}</time>
            </span>
            <span className="thread-last muted small">{t.last_body}</span>
            {t.unread_admin > 0 && <span className="chat-badge static">{t.unread_admin}</span>}
            {t.status === "closed" && <span className="tag">Užbaigtas</span>}
          </button>
        ))}
      </div>

      <div className="card thread-view">
        {!cur ? (
          <div className="empty"><span className="big">💬</span>Pasirink pokalbį kairėje</div>
        ) : (
          <>
            <div className="thread-head">
              <strong>{cur.name || `Anonimas #${cur.id}`}</strong>
              <div className="actions">
                <button type="button" className="btn ghost small" onClick={async () => { await adminSetThreadStatus(cur.id, cur.status === "open" ? "closed" : "open"); loadThreads(); }}>
                  {cur.status === "open" ? "✓ Užbaigti" : "↺ Atnaujinti"}
                </button>
                <button type="button" className="btn danger small" onClick={async () => { if (confirm("Ištrinti visą pokalbį?")) { await adminDeleteThread(cur.id); setActive(null); loadThreads(); } }}>
                  Ištrinti
                </button>
              </div>
            </div>
            <div className="chat-list" ref={listRef}>
              {msgs.map((m) => (
                <div key={m.id} className={`msg ${m.admin ? "me" : "them"}`}>
                  {m.admin && <span className="msg-author">{m.author}</span>}
                  <p>{m.body}</p>
                  <time>{when(m.at)}</time>
                </div>
              ))}
            </div>
            <form className="chat-row" onSubmit={reply}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} placeholder="Atsakymas…"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) reply(e); }} />
              <button type="submit" className="btn" disabled={!text.trim()}>Siųsti</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
