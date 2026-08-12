const VERSION = 'nabe-pwa-v2';

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

// Aucun intercepteur fetch : la boutique reste pilotée directement par les
// stratégies de cache Next.js/Vercel, sans passage obligatoire par le worker.
