/* Room Alert service worker v2.
   Needed for: Android system notifications, installability, and future Web Push (FCM). */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {}); // passthrough, no caching

// Web Push receiver (works once a push server / FCM Cloud Function sends to this device)
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: e.data && e.data.text() }; }
  const n = d.notification || d;
  e.waitUntil(self.registration.showNotification(n.title || "🔔 Room Alert", {
    body: n.body || "Open the app to respond.",
    tag: "room-alert", renotify: true, requireInteraction: true,
    vibrate: [500, 200, 500, 200, 500], data: { url: (d.data && d.data.url) || self.registration.scope }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
