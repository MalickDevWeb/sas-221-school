import { useEffect, useRef } from 'react';
import { objetBrut, texteOuNull, vrai } from '@/shared/lib/lectureServeur';

/**
 * Accès à la corbeille depuis un message de suppression (« … placé dans la corbeille. [Ouvrir la corbeille] »).
 * Les espaces (administration, professeur) écoutent cet événement et ouvrent leur onglet « Corbeille » : le
 * composant qui supprime n'a pas à connaître la navigation de l'espace.
 */
const EVENEMENT = 'myschool:ouvrir-corbeille';

export function ouvrirCorbeille(): void {
  window.dispatchEvent(new Event(EVENEMENT));
}

/** L'espace appelle ce crochet avec la fonction qui affiche son onglet « Corbeille ». */
export function useOuvertureCorbeille(ouvrir: () => void): void {
  const ref = useRef(ouvrir);
  useEffect(() => { ref.current = ouvrir; }, [ouvrir]);
  useEffect(() => {
    const ecouter = () => ref.current();
    window.addEventListener(EVENEMENT, ecouter);
    return () => window.removeEventListener(EVENEMENT, ecouter);
  }, []);
}

/**
 * Message de succès d'une suppression : quand le serveur répond « corbeille: true », son message (qui reprend le
 * libellé, ex. « Devoir “Exercices” — Algorithmique placé dans la corbeille. ») et l'indication qu'il reste
 * restaurable ; sinon le message prévu par l'écran.
 */
export function messageSuppression(reponse: unknown, defaut: string): { message: string; corbeille: boolean } {
  const corps = objetBrut(reponse);
  if (!vrai(corps.corbeille)) return { message: defaut, corbeille: false };
  return { message: texteOuNull(corps.message) ?? 'Élément placé dans la corbeille.', corbeille: true };
}

/** Phrase ajoutée sous un message « placé dans la corbeille » (la durée de conservation est celle du serveur,
 *  affichée dans la corbeille elle-même). */
export const RAPPEL_RESTAURATION = 'Restauration possible depuis la corbeille.';
