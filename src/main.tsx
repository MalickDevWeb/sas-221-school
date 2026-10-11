import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/core/providers/AppProviders'
import { AppRouter } from '@/core/router/AppRouter'
import { useTenantStore } from '@/core/store/tenantStore'
import '@/shared/design/reset.css'
import '@/shared/design/tokens.css'

// On s'assure de réappliquer le thème CSS depuis le localStorage (si l'utilisateur fait F5)
useTenantStore.getState().rehydrateTheme();

// Global safety patch to catch unhandled promise rejections from play() interruptions
// (e.g., when a camera video or audio beep element is removed from the DOM mid-play)
if (typeof window !== 'undefined' && typeof HTMLMediaElement !== 'undefined') {
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const promise = originalPlay.apply(this);
    if (promise && typeof promise.catch === 'function') {
      promise.catch((err: any) => {
        if (err && err.name === 'AbortError') {
          // Safe to ignore: play request was interrupted by component unmount or stop
          return;
        }
        console.warn("Media play failed or was interrupted:", err);
      });
    }
    return promise;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);

// Nettoyage et désactivation du Service Worker pour garantir des mises à jour instantanées
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  if (typeof caches !== 'undefined') {
    caches.keys().then((names) => {
      for (const name of names) caches.delete(name);
    });
  }
}


