/**
 * Accord en nombre (charte d'écriture, 2026-11-15) : « 0 élève », « 1 classe », « 12 places ».
 * En français, 0 et 1 prennent le singulier.
 */
export function pluriel(n: number, singulier: string, plurielForme = `${singulier}s`): string {
  return Math.abs(n) < 2 ? singulier : plurielForme;
}

/** Nombre suivi du nom accordé, nombre au format français : avec(1 420, 'élève') → « 1 420 élèves ». */
export function avecNombre(n: number, singulier: string, plurielForme?: string): string {
  return `${n.toLocaleString('fr-FR')} ${pluriel(n, singulier, plurielForme)}`;
}
