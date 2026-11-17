import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { resolveErrorMessage } from './errorDictionary';

/**
 * Place les erreurs du serveur sous les champs concernés d'un formulaire react-hook-form (APP-FE-14).
 *
 * Deux sources :
 * 1. `details` de la réponse d'erreur (validation Bean Validation : { champ: message }) ;
 * 2. le message seul (ex. 409 « Cette adresse e-mail est déjà utilisée. ») rapproché d'un champ par mot-clé.
 *
 * Renvoie le message à afficher en haut du formulaire quand aucune erreur n'a pu être rattachée à un champ,
 * sinon `null` (le message est déjà sous le champ, le premier champ en erreur reçoit le focus).
 */
export function reporterErreurServeur<T extends FieldValues>(
  erreur: unknown,
  setError: UseFormSetError<T>,
  options: {
    /** Champs du formulaire reconnus dans le message du serveur (ex. { email: /e-?mail/i }). */
    motsCles?: Partial<Record<Path<T>, RegExp>>;
    /** Nom du champ côté serveur → nom du champ du formulaire, quand ils diffèrent. */
    alias?: Record<string, Path<T>>;
    /** Champs du formulaire (pour ignorer un `details` qui ne correspond à aucun champ affiché). */
    champs?: readonly Path<T>[];
  } = {},
): string | null {
  const message = resolveErrorMessage(erreur);
  const data = (erreur as { response?: { data?: { details?: unknown } } })?.response?.data;
  const connus = options.champs ? new Set<string>(options.champs) : null;
  let premier = true;
  let rattache = false;
  const placer = (champ: Path<T>, texte: string) => {
    setError(champ, { type: 'serveur', message: texte }, { shouldFocus: premier });
    premier = false;
    rattache = true;
  };

  const details = data?.details;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    for (const [cle, valeur] of Object.entries(details as Record<string, unknown>)) {
      const champ = (options.alias?.[cle] ?? cle) as Path<T>;
      if (typeof valeur === 'string' && valeur.trim() && (!connus || connus.has(champ))) placer(champ, valeur.trim());
    }
  }
  if (!rattache && options.motsCles) {
    for (const [champ, motif] of Object.entries(options.motsCles) as [Path<T>, RegExp][]) {
      if (motif.test(message)) {
        placer(champ, message);
        break;
      }
    }
  }
  return rattache ? null : message;
}
