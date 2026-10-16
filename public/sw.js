// Service worker - Push Notifications & Cache Management
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Pass-through pur vers le réseau en mode standard
self.addEventListener('fetch', () => {
  // Pass-through
});

// Réception des notifications Push Web
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'École 221', body: event.data.text() };
    }
  }

  const title = data.title || 'École 221';
  const options = {
    body: data.body || 'Nouvelle alerte scolaire en temps réel.',
    icon: data.icon || '/myschool-icon.png',
    badge: '/myschool-icon.png',
    vibrate: [150, 75, 150],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur une notification Push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || targetUrl === '/') {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
