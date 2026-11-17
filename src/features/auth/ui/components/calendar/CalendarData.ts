export interface CourseSession {
  id: string;
  nom: string;
  jour: 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM';
  jourNom: string;
  heure: string;
  salle: string;
  professeur: string;
  type: 'CM' | 'TD' | 'TP';
  enCours?: boolean;
  color?: string;
  syllabus?: string;
  /** Classe réelle de la séance. */
  classe?: string;
}

export const DAYS_ORDER: { key: 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN' | 'SAM'; name: string }[] = [
  { key: 'LUN', name: 'LUNDI' }, { key: 'MAR', name: 'MARDI' },
  { key: 'MER', name: 'MERCREDI' }, { key: 'JEU', name: 'JEUDI' }, { key: 'VEN', name: 'VENDREDI' },
  { key: 'SAM', name: 'SAMEDI' }
];
