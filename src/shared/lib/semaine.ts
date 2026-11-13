/**
 * Dates réelles des jours de la semaine en cours (2026-11-13) : avant, l'en-tête affichait des dates écrites en dur
 * (« 23 Oct »…), sans rapport avec la semaine affichée.
 */
export function datesSemaineCourante(maintenant: Date = new Date()): Record<'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN', string> {
  const lundi = new Date(maintenant);
  const ecart = (maintenant.getDay() + 6) % 7; // 0 = lundi
  lundi.setDate(maintenant.getDate() - ecart);
  const jour = (i: number) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };
  return { LUN: jour(0), MAR: jour(1), MER: jour(2), JEU: jour(3), VEN: jour(4) };
}
