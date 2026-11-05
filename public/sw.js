// DG mokinių taryba: pranešimai ir paprastas veikimas be interneto
const OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("dg-v1").then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Jei nėra interneto, rodom nedidelį puslapį vietoj klaidos
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});

self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data?.json() ?? {}; } catch { data = { title: e.data?.text() }; }
  e.waitUntil(
    self.registration.showNotification(data.title || "DG mokinių taryba", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "/", self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if (c.url.startsWith(self.location.origin)) { c.navigate(url); return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
