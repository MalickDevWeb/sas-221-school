/*
 * Mêmes jours et heures que la grille de l'administration (Gestion École › Planning : lundi → samedi, 08h → 20h).
 */
export const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
export const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'] as const;
export const DAY_LABELS = { LUN: 'LUNDI', MAR: 'MARDI', MER: 'MERCREDI', JEU: 'JEUDI', VEN: 'VENDREDI', SAM: 'SAMEDI' };
export const SHORT_TO_FULL: Record<string, string> = { LUN: 'Lundi', MAR: 'Mardi', MER: 'Mercredi', JEU: 'Jeudi', VEN: 'Vendredi', SAM: 'Samedi' };
export { datesSemaineCourante } from '@/shared/lib/semaine';
