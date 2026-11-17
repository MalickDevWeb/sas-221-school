import { toast } from 'sonner';
import { avecNombre } from '@/shared/lib/pluriel';
import { estObjet, objetBrut, texteOuNull } from '@/shared/lib/lectureServeur';
import { messageSuppression, ouvrirCorbeille, RAPPEL_RESTAURATION } from './navigationCorbeille';

/**
 * Messages de suppression affichés par les écrans (16/11, réponses « placé dans la corbeille » du serveur) :
 * - DELETE … → { corbeille: true, message, libelle, … } (salles, créneaux, filières, classes, évaluations, valeurs
 *   de référentiel, messages de groupe) ;
 * - PUT des listes du planning (/admin/planning/rooms|filieres|classes|slots) → { …, misALaCorbeille: [...] } :
 *   les lignes absentes de la liste envoyée sont placées dans la corbeille.
 * Réponse encore vide (204, serveur pas encore à jour) : l'écran garde son propre message.
 */

const ACTION = { label: 'Ouvrir la corbeille', onClick: ouvrirCorbeille };

/**
 * Annonce le résultat d'une suppression : message du serveur et bouton « Ouvrir la corbeille » si l'élément est dans
 * la corbeille, sinon le message prévu par l'écran. Renvoie true si le serveur a confirmé la mise à la corbeille.
 */
export function annoncerSuppression(reponse: unknown, defaut: string): boolean {
  const { message, corbeille } = messageSuppression(reponse, defaut);
  if (corbeille) toast.success(message, { description: RAPPEL_RESTAURATION, action: ACTION });
  else toast.success(message);
  return corbeille;
}

/**
 * Éléments placés dans la corbeille par l'enregistrement d'une liste (« misALaCorbeille »), lus sans rien inventer :
 * le message du serveur de chaque élément s'il en donne un ; sinon seul leur nombre est connu (jamais un identifiant
 * technique affiché).
 */
export function misesALaCorbeille(reponse: unknown): { nombre: number; messages: string[] } {
  const liste = objetBrut(reponse).misALaCorbeille;
  if (!Array.isArray(liste)) return { nombre: 0, messages: [] };
  const messages = liste
    .map((e) => (estObjet(e) ? texteOuNull(e.message) : null))
    .filter((m): m is string => m !== null);
  return { nombre: liste.length, messages };
}

/**
 * Annonce les éléments placés dans la corbeille par l'enregistrement d'une liste, avec « Ouvrir la corbeille ».
 * Renvoie false si la réponse n'en signale aucun (réponse vide ou ancienne forme) : l'écran garde alors son message.
 */
export function annoncerMisesALaCorbeille(reponse: unknown): boolean {
  const { nombre, messages } = misesALaCorbeille(reponse);
  if (nombre === 0) return false;
  const titre = nombre === 1 && messages.length === 1
    ? messages[0]
    : `${avecNombre(nombre, 'élément placé', 'éléments placés')} dans la corbeille.`;
  const details = nombre > 1 ? messages.slice(0, 3).join(' ') + (messages.length > 3 ? ' …' : '') : '';
  toast.success(titre, { description: `${details ? `${details} ` : ''}${RAPPEL_RESTAURATION}`, action: ACTION });
  return true;
}
