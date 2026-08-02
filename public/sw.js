const VERSION = 'nabe-pwa-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cles) =>
        Promise.all(cles.filter((cle) => cle.startsWith('nabe-pwa-') && cle !== VERSION).map((cle) => caches.delete(cle))),
      ),
    ]),
  );
});

// Une boutique ne doit jamais afficher un prix ou un stock ancien.
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && new URL(event.request.url).origin === self.location.origin) {
    event.respondWith(fetch(event.request));
  }
});
