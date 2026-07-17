const CACHE_NAME = "emergency-offline-cache-v1";

// Cache static fallback assets if needed
const STATIC_ASSETS = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept public emergency page requests and emergency details API
  const isEmergencyPage = url.pathname.startsWith("/e/");
  const isEmergencyApi = url.pathname.includes("/api/public/emergency/");

  if (isEmergencyPage || isEmergencyApi) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback message if completely offline and not cached
            if (isEmergencyApi) {
              return new Response(
                JSON.stringify({
                  error: "Offline mode. Emergency data not cached yet.",
                  data: null
                }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" }
                }
              );
            }
            return new Response(
              "<html><body><h1>オフラインモード</h1><p>このペットの緊急データはキャッシュされていません。</p></body></html>",
              {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" }
              }
            );
          });
        })
    );
  }
});
