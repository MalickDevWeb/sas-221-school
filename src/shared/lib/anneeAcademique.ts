/**
 * Année universitaire en cours, calculée à partir de la date du jour (rentrée en septembre).
 * Avant : « 2025-26 » / « 2025-2026 » écrits en dur dans plusieurs écrans.
 */
export function anneeAcademique(date: Date = new Date()): string {
  const debut = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1;
  return `${debut}-${debut + 1}`;
}

/** Forme courte : « 2026-27 ». */
export function anneeAcademiqueCourte(date: Date = new Date()): string {
  const [a, b] = anneeAcademique(date).split('-');
  return `${a}-${b.slice(2)}`;
}
