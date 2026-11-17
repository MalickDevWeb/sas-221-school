import { lazy, type LazyExoticComponent } from 'react';

/** Composant acceptable par React.lazy (même contrainte que lui). */
type Chargeable = Awaited<ReturnType<Parameters<typeof lazy>[0]>>['default'];

/** Page chargée à la demande dont le code peut être téléchargé à l'avance. */
export type PageALaDemande<T extends Chargeable> = LazyExoticComponent<T> & {
  /**
   * Télécharge le code de la page sans l'afficher (ex. pendant la vérification du mot de passe). Un seul essai, jamais
   * de rechargement de la page ; le téléchargement est repris par l'affichage au lieu d'être recommencé.
   */
  precharger: () => Promise<void>;
};

const CLE_RECHARGEMENT = 'ecole221-rechargement-module';

/** Promesse portant son état (protocole des « thenables » que React lit : status, value, reason). */
type PromesseSuivie<M> = Promise<M> & { status?: 'fulfilled' | 'rejected'; value?: M; reason?: unknown };

/**
 * Marque la promesse tenue (ou rompue) dès qu'elle l'est. En PRODUCTION, React.lazy ne le fait pas
 * (seule sa version de développement le fait) : React conclurait alors que le code d'une page préchargée n'est pas
 * encore là, afficherait l'écran de chargement, puis attendrait au moins 300 ms avant d'afficher la page.
 */
function suivre<M>(promesse: Promise<M>): PromesseSuivie<M> {
  const suivie: PromesseSuivie<M> = promesse;
  promesse.then(
    (valeur) => { suivie.status = 'fulfilled'; suivie.value = valeur; },
    (raison: unknown) => { suivie.status = 'rejected'; suivie.reason = raison; },
  );
  return suivie;
}

/**
 * `React.lazy` résistant aux coupures réseau : 3 essais espacés, puis, s'il y a du réseau, un rechargement complet
 * de la page (une fois par minute au plus, jamais en boucle), sinon l'écran d'erreur de l'application.
 * Préchargeable (`precharger()`), pour que l'espace s'ouvre sans attendre son code après la connexion.
 */
export function lazyAvecRelance<T extends Chargeable>(
  charger: () => Promise<{ default: T }>,
  essais = 3,
): PageALaDemande<T> {
  /** Téléchargement lancé par precharger() (en cours ou réussi), repris par le premier affichage. */
  let precharge: PromesseSuivie<{ default: T }> | null = null;

  const chargerAvecRelance = async (): Promise<{ default: T }> => {
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
    // Rechargement seulement avec du réseau : hors ligne, il afficherait la page d'erreur du navigateur au lieu de
    // l'écran d'erreur de l'application (relevé par hors_ligne_navigateur).
    const enLigne = typeof navigator === 'undefined' || navigator.onLine;
    if (enLigne && Date.now() - dernierRechargement > 60_000) {
      try { sessionStorage.setItem(CLE_RECHARGEMENT, String(Date.now())); } catch { /* stockage indisponible */ }
      window.location.reload();
      return new Promise<never>(() => { /* la page se recharge */ });
    }
    throw derniere;
  };

  const page = lazy<T>(() => {
    // Code déjà téléchargé : promesse déjà marquée tenue, affichée sans écran de chargement
    if (precharge?.status === 'fulfilled') return precharge;
    // Préchargement en cours : repris ; s'il échoue, essais normaux (relance, rechargement)
    return suivre(precharge ? precharge.catch(() => chargerAvecRelance()) : chargerAvecRelance());
  });

  return Object.assign(page, {
    precharger: (): Promise<void> => {
      if (!precharge) {
        const essai = suivre(charger());
        precharge = essai;
        // Échec (réseau coupé…) : oublié, pour qu'un prochain préchargement ou l'affichage réessaie
        essai.catch(() => { if (precharge === essai) precharge = null; });
      }
      return precharge.then(() => undefined, () => undefined);
    },
  });
}
