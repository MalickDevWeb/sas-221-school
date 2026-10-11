// Service worker désactivé et nettoyage proactif de tous les caches existants
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[Service Worker] Suppression immédiate du cache obsolète:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Ne rien intercepter en mode dev / navigation afin d'éviter tout chevauchement ou mise en cache de versions conflictuelles
self.addEventListener('fetch', () => {
  // Pass-through pur vers le réseau
});
