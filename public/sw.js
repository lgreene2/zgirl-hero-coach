/* Z-Girl Hero Coach Service Worker (basic offline cache)
   - Cache-first for static assets
   - Network-first for /api/chat
   - Offline fallback page
*/
const CACHE_VERSION = "zgirl-cache-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const OFFLINE_URL = "/offline.html";

// Install: pre-cache offline page + icons
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([
        OFFLINE_URL,
        "/icons/icon-192.png",
        "/icons/icon-512.png",
      ]);
      self.skipWaiting();
    })()
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) return caches.delete(key);
        })
      );
      self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || (request.destination === "document");
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.method === "GET" &&
    (request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "image" ||
      request.destination === "font" ||
      url.pathname.startsWith("/_next/") ||
      url.pathname.startsWith("/icons/"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Network-first for chat API to avoid stale replies
  if (url.pathname.startsWith("/api/chat")) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (err) {
          return new Response(
            JSON.stringify({
              ok: false,
              code: "OFFLINE",
              reply: "You're offline right now. Reconnect and try again.",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
      })()
    );
    return;
  }

  // Cache-first for static assets
  if (isStaticAsset(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const resp = await fetch(request);
        // Only cache successful responses
        if (resp && resp.status === 200) {
          cache.put(request, resp.clone());
        }
        return resp;
      })()
    );
    return;
  }

  // Navigation: network-first, fallback offline page
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const resp = await fetch(request);
          return resp;
        } catch (err) {
          const cache = await caches.open(STATIC_CACHE);
          const offline = await cache.match(OFFLINE_URL);
          return offline || new Response("Offline", { status: 503 });
        }
      })()
    );
  }
});
