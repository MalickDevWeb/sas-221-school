/**
 * Lien d'une réunion Google Meet collé par l'enseignant ou l'administration (APP-TL-26).
 * Aucune API Google ni connexion à un compte Google depuis l'application : la réunion est créée sur
 * meet.google.com (gratuite avec un compte Gmail), puis son lien est collé ici.
 * Même règle que le serveur (POST /student/live-sessions et POST /collaboration/meets).
 */
const FORME_MEET = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\?\S*)?$/i;

/** Ajoute « https:// » quand il a été omis (« meet.google.com/abc-defg-hij »). */
export function normaliserLienMeet(brut: string): string {
  const t = brut.trim();
  return /^https?:\/\//i.test(t) ? t : 'https://' + t;
}

/** Message à afficher à l'utilisateur, ou null si le lien est un lien Google Meet. */
export function erreurLienMeet(brut: string): string | null {
  const t = brut.trim();
  if (!t) return 'Collez le lien de la réunion : créez-la sur meet.google.com (« Nouvelle réunion »), puis copiez son lien ici.';
  if (!FORME_MEET.test(normaliserLienMeet(t))) {
    return `« ${t} » n'est pas un lien Google Meet (forme attendue : https://meet.google.com/abc-defg-hij).`;
  }
  return null;
}
