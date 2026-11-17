import { apiClient } from '@/shared/lib/apiClient';

/** Code renvoyé par le serveur (403) tant que le mot de passe provisoire n'a pas été remplacé. */
export const CODE_MOT_DE_PASSE_PROVISOIRE = 'MOT_DE_PASSE_PROVISOIRE';

/**
 * Contrôle avant envoi, avec la longueur minimale donnée par le serveur pour le rôle du compte
 * (GET /auth/regles-mot-de-passe, voir reglesMotDePasseApi.ts) ; null si elle n'est pas encore connue (le serveur
 * contrôle alors seul). Aucune règle « une lettre et un chiffre » (phrases de passe acceptées).
 */
export function erreurReglesMotDePasse(nouveau: string, longueurMin: number | null): string | null {
  if (!nouveau.trim()) return 'Le nouveau mot de passe est obligatoire.';
  if (longueurMin !== null && [...nouveau].length < longueurMin) {
    return `Le nouveau mot de passe doit contenir au moins ${longueurMin} caractères.`;
  }
  return null;
}

/** POST /auth/changer-mot-de-passe — efface l'obligation de changer un mot de passe provisoire. */
export async function changerMotDePasse(ancien: string, nouveau: string): Promise<void> {
  await apiClient.post('/auth/changer-mot-de-passe', { ancien, nouveau });
}
