/**
 * Dates réelles des jours de la semaine en cours (2026-11-13) : avant, l'en-tête affichait des dates écrites en dur
 * (« 23 Oct »…), sans rapport avec la semaine affichée.
 */
export type JourSemaine = 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM';

/** Date (objet) du jour donné dans la semaine en cours (lundi = début de semaine). */
export function dateDuJour(code: JourSemaine, maintenant: Date = new Date()): Date {
  const ordre: JourSemaine[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const d = new Date(maintenant);
  d.setDate(maintenant.getDate() - ((maintenant.getDay() + 6) % 7) + Math.max(0, ordre.indexOf(code)));
  return d;
}

/**
 * Date AAAAMMJJ du jour donné dans la semaine en cours, pour les exports d'agenda (2026-11-14 : avant, toutes les
 * séances exportées tombaient la semaine du 23 octobre 2023).
 */
export function dateCompacteDuJour(code: JourSemaine, maintenant: Date = new Date()): string {
  const d = dateDuJour(code, maintenant);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export function datesSemaineCourante(maintenant: Date = new Date()): Record<JourSemaine, string> {
  const lundi = new Date(maintenant);
  const ecart = (maintenant.getDay() + 6) % 7; // 0 = lundi
  lundi.setDate(maintenant.getDate() - ecart);
  const jour = (i: number) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  return { LUN: jour(0), MAR: jour(1), MER: jour(2), JEU: jour(3), VEN: jour(4), SAM: jour(5) };
}
