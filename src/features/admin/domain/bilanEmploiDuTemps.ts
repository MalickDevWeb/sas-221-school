/**
 * Bilan renvoyé par PUT /admin/planning/slots (2026-11-14) : chaque créneau rattaché à une classe devient une séance du
 * professeur, visible aussi par les élèves de la classe et leurs parents. Un créneau sans matière de même nom dans sa
 * classe n'a pas de feuille d'appel ; un créneau sans professeur reconnu n'apparaît chez aucun professeur.
 */
export interface BilanEmploiDuTemps {
  seances: number | null;
  sansCours: string[];
  sansProfesseur: string[];
}

export function lireBilan(data: unknown): BilanEmploiDuTemps {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const liste = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    seances: typeof d.seances === 'number' ? d.seances : null,
    sansCours: liste(d.sansCours),
    sansProfesseur: liste(d.sansProfesseur),
  };
}

const extrait = (l: string[]) => l.slice(0, 3).join(', ') + (l.length > 3 ? `, et ${l.length - 3} autre(s)` : '');

/** Avertissement à afficher, ou null si tous les créneaux sont reliés à une matière et à un professeur. */
export function avertissementBilan(b: BilanEmploiDuTemps): string | null {
  const parts: string[] = [];
  if (b.sansCours.length > 0) {
    parts.push(`${b.sansCours.length} créneau(x) sans matière de ce nom dans la classe, donc sans feuille d'appel : ${extrait(b.sansCours)}. `
      + 'Créez la matière dans « Promotions & Classes » ou corrigez l\'intitulé du créneau.');
  }
  if (b.sansProfesseur.length > 0) {
    parts.push(`${b.sansProfesseur.length} créneau(x) sans professeur reconnu : ${extrait(b.sansProfesseur)}.`);
  }
  return parts.length ? parts.join(' ') : null;
}

export function messageBilan(b: BilanEmploiDuTemps): string {
  return b.seances == null
    ? 'Emploi du temps enregistré.'
    : `Emploi du temps enregistré : ${b.seances} séance(s) transmise(s) aux professeurs, aux élèves et à leurs parents.`;
}
