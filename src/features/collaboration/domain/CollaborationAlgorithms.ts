import { GroupMember } from './CollaborationModels';

/**
 * Critères de répartition automatique. Seuls ceux qui reposent sur des données réelles sont proposés : la moyenne,
 * le sexe et les compétences ne sont pas transmis par le serveur.
 */
export type GroupingCriterion = 'alpha' | 'random';

/** Répartit les élèves en `nombre` groupes d'effectifs égaux à un élève près (aucun groupe vide). */
export function repartirEleves(eleves: readonly GroupMember[], nombre: number, critere: GroupingCriterion,
                               hasard: () => number = Math.random): GroupMember[][] {
  const n = Math.min(Math.max(1, Math.floor(nombre)), eleves.length);
  if (eleves.length === 0) return [];
  const pool = [...eleves];
  if (critere === 'alpha') {
    pool.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  } else {
    for (let i = pool.length - 1; i > 0; i--) {   // mélange de Fisher-Yates (le tri aléatoire est biaisé)
      const j = Math.floor(hasard() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  if (critere === 'alpha') {
    // blocs consécutifs : A–D, E–K…
    const taille = Math.floor(pool.length / n);
    const reste = pool.length % n;
    const groupes: GroupMember[][] = [];
    let debut = 0;
    for (let g = 0; g < n; g++) {
      const fin = debut + taille + (g < reste ? 1 : 0);
      groupes.push(pool.slice(debut, fin));
      debut = fin;
    }
    return groupes;
  }
  const groupes: GroupMember[][] = Array.from({ length: n }, () => []);
  pool.forEach((e, i) => groupes[i % n].push(e));
  return groupes;
}
