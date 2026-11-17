/**
 * Année scolaire / universitaire en cours — SOURCE UNIQUE de l'application (écrans et documents officiels).
 * Convention septembre → août tant que le serveur ne fournit pas l'année de l'école : c'est ici seulement qu'il
 * faudra la brancher.
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
