// ──────────────────────────────────────────────────────────
// frontend/public/sw.js  — Progressive Web App Service Worker
//
// Strategy: Cache-first for local assets & App Shell,
// Network-first for dynamic content with fallback (Requirement 5).
// ──────────────────────────────────────────────────────────

const CACHE_NAME = 'visit-injibara-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
];

// Install: Cache essential shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
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

// Fetch: Stale-while-revalidate for local origin assets, avoid bulk external tile scraping
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept or bulk-cache OpenStreetMap external tiles per policy (Req 5.8)
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, nothing to do, fallback already handled below
        });

      return cachedResponse || fetchPromise;
    })
  );
});
