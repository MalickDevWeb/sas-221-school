import { lazy, type LazyExoticComponent } from 'react';

/** Composant acceptable par React.lazy (même contrainte que lui). */
type Chargeable = Awaited<ReturnType<Parameters<typeof lazy>[0]>>['default'];

const CLE_RECHARGEMENT = 'ecole221-rechargement-module';

/**
 * `React.lazy` résistant aux coupures réseau (2026-11-14). Avant : un seul échec de téléchargement d'une page
 * (réseau mobile instable, changement de réseau) affichait l'écran d'erreur. Désormais : 3 essais espacés, puis un
 * rechargement complet de la page (une seule fois par minute, pour ne jamais boucler), puis l'écran d'erreur.
 */
export function lazyAvecRelance<T extends Chargeable>(
  charger: () => Promise<{ default: T }>,
  essais = 3,
): LazyExoticComponent<T> {
  return lazy<T>(async () => {
    let derniere: unknown;
    for (let i = 0; i < essais; i++) {
      try {
        const module = await charger();
        try { sessionStorage.removeItem(CLE_RECHARGEMENT); } catch { /* stockage indisponible */ }
        return module;
      } catch (e) {
        derniere = e;
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
    let dernierRechargement = 0;
    try { dernierRechargement = Number(sessionStorage.getItem(CLE_RECHARGEMENT) ?? 0); } catch { /* stockage indisponible */ }
    if (Date.now() - dernierRechargement > 60_000) {
      try { sessionStorage.setItem(CLE_RECHARGEMENT, String(Date.now())); } catch { /* stockage indisponible */ }
      window.location.reload();
      return new Promise<never>(() => { /* la page se recharge */ });
    }
    throw derniere;
  });
}
