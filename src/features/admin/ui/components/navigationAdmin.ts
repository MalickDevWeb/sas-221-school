import { useEffect, useRef } from 'react';
import { ENTREES_MENU_ADMIN } from './menuAdmin';

/**
 * Ouverture d'un écran de l'administration depuis un autre écran (16/11) : par exemple le lien « Transferts d'élèves »
 * de l'annuaire des élèves. L'espace administration écoute cet événement (palette de commandes, toujours montée) et
 * affiche l'onglet demandé : l'écran qui fait le lien n'a pas à connaître la navigation de l'espace.
 * Même principe que l'ouverture de la corbeille (features/corbeille/navigationCorbeille.ts).
 */
const EVENEMENT = 'myschool:ouvrir-onglet-admin';

/** Demande l'affichage d'un onglet du menu de l'administration (identifiant de menuAdmin.ts, ex. « transferts »). */
export function ouvrirOngletAdmin(onglet: string): void {
  window.dispatchEvent(new CustomEvent<string>(EVENEMENT, { detail: onglet }));
}

/** L'espace administration appelle ce crochet avec la fonction qui change d'onglet. Onglet inconnu : ignoré. */
export function useOuvertureOngletAdmin(ouvrir: (onglet: string) => void): void {
  const ref = useRef(ouvrir);
  useEffect(() => { ref.current = ouvrir; }, [ouvrir]);
  useEffect(() => {
    const ecouter = (e: Event) => {
      const onglet = e instanceof CustomEvent ? e.detail : null;
      if (typeof onglet === 'string' && ENTREES_MENU_ADMIN.some((m) => m.id === onglet)) ref.current(onglet);
    };
    window.addEventListener(EVENEMENT, ecouter);
    return () => window.removeEventListener(EVENEMENT, ecouter);
  }, []);
}
