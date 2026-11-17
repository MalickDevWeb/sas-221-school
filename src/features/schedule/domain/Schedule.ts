// L'administration planifie du lundi au samedi.
export type CourseDay = 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM';

export const JOURS_OUVRES: CourseDay[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
export const LIBELLES_JOURS: Record<CourseDay, string> = { LUN: 'Lundi', MAR: 'Mardi', MER: 'Mercredi', JEU: 'Jeudi', VEN: 'Vendredi', SAM: 'Samedi' };

/** Jours à afficher : lundi → vendredi, plus le samedi s'il porte au moins une séance. */
export function joursAffiches(sessions: readonly { jour: CourseDay }[]): CourseDay[] {
  return sessions.some((s) => s.jour === 'SAM') ? [...JOURS_OUVRES, 'SAM'] : JOURS_OUVRES;
}
export type CourseType = 'CM' | 'TD' | 'TP';
export type CourseStatus = 'termine' | 'actuel' | 'a_venir' | 'annule';

export interface CourseSession {
  readonly id: string;
  readonly nom: string;
  readonly jour: CourseDay;
  readonly jourComplet: string;
  readonly dateStr: string;
  readonly heureDebut: string;
  readonly heureFin: string;
  readonly heureStr: string;
  readonly type: CourseType;
  readonly salle: string;
  readonly professeur: string;
  readonly description: string;
  readonly status: CourseStatus;
  readonly cancellationReason?: string;
  /** Nom de la classe. */
  readonly classe?: string;
}

/**
 * Filtre pur : Récupère uniquement les cours d'un jour donné
 */
export function filterSessionsByDay(sessions: CourseSession[], day: CourseDay): CourseSession[] {
  return sessions.filter(session => session.jour === day);
}

/**
 * Calcul pur : Détermine si un cours est en cours (actuel) à un instant T (basé sur l'heure locale)
 * Note: Dans un vrai système, on utiliserait des objets Date, ici on simule avec l'heure
 */
export function isSessionActive(session: CourseSession, currentTime: string): boolean {
  // Simplification : currentTime format "HH:MM"
  return currentTime >= session.heureDebut && currentTime <= session.heureFin;
}

/** Classes réelles de l'élève, tirées de ses séances (vide si aucune séance). */
export function classesDe(sessions: readonly CourseSession[]): string[] {
  return Array.from(new Set(sessions.map((s) => (s.classe || '').trim()).filter(Boolean)));
}

/** Durée d'une séance en heures (0 si l'horaire est illisible). */
export function dureeHeures(s: Pick<CourseSession, 'heureDebut' | 'heureFin'>): number {
  const m = (t: string) => { const r = /^(\d{1,2}):(\d{2})$/.exec((t || '').trim()); return r ? Number(r[1]) * 60 + Number(r[2]) : null; };
  const d = m(s.heureDebut); const f = m(s.heureFin);
  return d != null && f != null && f > d ? (f - d) / 60 : 0;
}

/** « Semaine du 9 au 14 novembre 2026 » : semaine en cours, jusqu'au samedi s'il porte une séance. */
export function libelleSemaine(sessions: readonly CourseSession[], maintenant: Date = new Date()): string {
  const lundi = new Date(maintenant);
  lundi.setDate(maintenant.getDate() - ((maintenant.getDay() + 6) % 7));
  const fin = new Date(lundi);
  fin.setDate(lundi.getDate() + (sessions.some((s) => s.jour === 'SAM') ? 5 : 4));
  const mois = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long' });
  const debut = lundi.getMonth() === fin.getMonth() ? `${lundi.getDate()}` : `${lundi.getDate()} ${mois(lundi)}`;
  return `Semaine du ${debut} au ${fin.getDate()} ${mois(fin)} ${fin.getFullYear()}`;
}
