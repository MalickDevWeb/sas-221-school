import { dateServeur } from './dateServeur';
import { dateFr } from './formatsFr';

/** Espace insécable (charte d'écriture §7 : « 8 h 30 » ne se coupe pas en fin de ligne). */
const INSECABLE = String.fromCharCode(160);

/**
 * Date et heure dans une phrase (charte d'écriture §3) : « 15 nov. 2026 à 8 h 30 », « 15 nov. 2026 à 8 h ».
 * null si la date du serveur est absente ou illisible (l'écran choisit alors son texte).
 */
export function dateHeurePhrase(v: unknown): string | null {
  const d = dateServeur(v);
  if (!d) return null;
  const m = d.getMinutes();
  return `${dateFr(d)} à ${d.getHours()}${INSECABLE}h${m ? `${INSECABLE}${String(m).padStart(2, '0')}` : ''}`;
}
