import { apiClient } from '@/shared/lib/apiClient';

/** Code renvoyé par le serveur (403) tant que le mot de passe provisoire n'a pas été remplacé. */
export const CODE_MOT_DE_PASSE_PROVISOIRE = 'MOT_DE_PASSE_PROVISOIRE';

/** Mêmes règles que le serveur (ChangementMotDePasseService.erreurRegles). */
export const LONGUEUR_MIN_MOT_DE_PASSE = 10;

export function erreurReglesMotDePasse(nouveau: string): string | null {
  if (!nouveau.trim()) return 'Le nouveau mot de passe est obligatoire.';
  if (nouveau.length < LONGUEUR_MIN_MOT_DE_PASSE) {
    return `Le nouveau mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
  }
  if (!/\p{L}/u.test(nouveau) || !/\p{N}/u.test(nouveau)) {
    return 'Le nouveau mot de passe doit contenir au moins une lettre et un chiffre.';
  }
  return null;
}

/** POST /auth/changer-mot-de-passe — efface l'obligation de changer un mot de passe provisoire. */
export async function changerMotDePasse(ancien: string, nouveau: string): Promise<void> {
  await apiClient.post('/auth/changer-mot-de-passe', { ancien, nouveau });
}
