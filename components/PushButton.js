"use client";

import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush } from "@/app/content-actions";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function b64ToBytes(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function PushButton({ className = "btn ghost small" }) {
  const [state, setState] = useState("loading"); // loading | unsupported | ios | off | on | denied | busy
  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
      if (!KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return setState(ios && !standalone ? "ios" : "unsupported");
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function toggle() {
    const prev = state;
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (prev === "on" && existing) {
        await unsubscribePush(existing.endpoint);
        await existing.unsubscribe();
        return setState("off");
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setState(perm === "denied" ? "denied" : "off");
      const sub = existing ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(KEY) }));
      await subscribePush(JSON.parse(JSON.stringify(sub)));
      setState("on");
    } catch (e) {
      console.error(e);
      setState(prev);
    }
  }

  if (state === "loading" || state === "unsupported") return null;
  if (state === "ios") return <span className="muted small">🔔 Pranešimams iPhone: Bendrinti → „Pridėti prie pradžios ekrano“</span>;
  if (state === "denied") return <span className="muted small">🔕 Pranešimai užblokuoti naršyklės nustatymuose</span>;
  return (
    <button type="button" className={className} onClick={toggle} disabled={state === "busy"}>
      {state === "on" ? "🔔 Pranešimai įjungti" : state === "busy" ? "…" : "🔔 Gauti pranešimus"}
    </button>
  );
}
