// Kusini Lodge service worker — app-shell cache for installability + offline
// load. Live transfer data flows over Convex's WebSocket, which queues mutations
// while offline and flushes them on reconnect; this SW only keeps the shell
// available so the app opens at a low-connectivity airstrip.
const CACHE = "kusini-lodge-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache Convex/Clerk traffic — it must be live.
  if (url.hostname.endsWith(".convex.cloud") || url.hostname.includes("clerk")) return;

  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => hit),
    ),
  );
});
