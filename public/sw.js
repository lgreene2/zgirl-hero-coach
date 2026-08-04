/* Z-Girl v2.2.2 service worker
   - Registers from the application shell
   - Network-first pages with an offline fallback
   - Stale-while-revalidate static assets
   - User-controlled updates (no surprise reloads)
*/
const CACHE_VERSION = "zgirl-cache-v2-2-2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        OFFLINE_URL,
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
      ])
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (key.startsWith(CACHE_VERSION) ? Promise.resolve() : caches.delete(key))));
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return request.method === "GET" && (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/icons/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== "GET") return;

  // Confidential reviewer pages, session checks, and audio must never enter a
  // service-worker cache or fall back to a previously viewed copy.
  if (url.pathname.startsWith("/review") || url.pathname.startsWith("/api/review")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (url.pathname.startsWith("/api/chat") || url.pathname.startsWith("/api/zgirl")) {
    event.respondWith(
      fetch(request).catch(() => new Response(
        JSON.stringify({ ok: false, code: "OFFLINE", reply: "You're offline right now. Reconnect and try again." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      ))
    );
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        const refreshed = fetch(request).then((response) => {
          if (response?.status === 200) void cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || refreshed;
      })()
    );
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          const response = await fetch(request);
          if (response?.status === 200) void cache.put(request, response.clone());
          return response;
        } catch {
          return (await cache.match(request)) || (await caches.match(OFFLINE_URL)) || new Response("Offline", { status: 503 });
        }
      })()
    );
  }
});
