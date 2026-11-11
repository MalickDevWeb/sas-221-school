export interface CourseSession {
  id: string;
  nom: string;
  jour: 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN';
  jourNom: string;
  heure: string;
  salle: string;
  professeur: string;
  type: 'CM' | 'TD' | 'TP';
  enCours?: boolean;
  color?: string;
  syllabus?: string;
}

export const DAYS_ORDER: { key: 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN'; name: string }[] = [
  { key: 'LUN', name: 'LUNDI' }, { key: 'MAR', name: 'MARDI' },
  { key: 'MER', name: 'MERCREDI' }, { key: 'JEU', name: 'JEUDI' }, { key: 'VEN', name: 'VENDREDI' }
];
