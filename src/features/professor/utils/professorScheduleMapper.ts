import type { ProfessorSchedule } from '../domain/ProfessorModels';
import type { CourseSession } from '@/features/schedule/domain/Schedule';
import { decouperHoraire } from './scheduleFormatter';

// Samedi et noms anglais reconnus.
const DAY_MAP: Record<string, CourseSession['jour']> = {
  LUNDI: 'LUN', LUN: 'LUN', MONDAY: 'LUN',
  MARDI: 'MAR', MAR: 'MAR', TUESDAY: 'MAR',
  MERCREDI: 'MER', MER: 'MER', WEDNESDAY: 'MER',
  JEUDI: 'JEU', JEU: 'JEU', THURSDAY: 'JEU',
  VENDREDI: 'VEN', VEN: 'VEN', FRIDAY: 'VEN',
  SAMEDI: 'SAM', SAM: 'SAM', SATURDAY: 'SAM',
};

export function jourDeSeance(day: string | null | undefined): CourseSession['jour'] | null {
  const k = (day ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  return DAY_MAP[k] ?? null;
}

/** null si le jour de la séance n'est pas reconnu (la séance n'est alors pas exportée : aucun jour inventé). */
export function mapProfessorScheduleToCourseSession(s: ProfessorSchedule): CourseSession | null {
  // Horaire réel de la séance ; plus d'horaire inventé (08:00-10:00) quand le format n'était pas reconnu.
  const h = decouperHoraire(s.time);
  const start = h?.debut ?? '';
  const end = h?.fin ?? '';
  const mappedDay = jourDeSeance(s.day);
  if (!mappedDay) return null;
  return {
    id: s.id,
    nom: s.courseTitle,
    professeur: 'Enseignant',
    salle: s.room,
    jour: mappedDay,
    jourComplet: s.day,
    dateStr: s.dateStr || '',
    heureDebut: start,
    heureFin: end,
    heureStr: s.time,
    type: s.type,
    status: s.status === 'annule' ? 'annule' : 'a_venir',
    description: `Cours d'enseignement : ${s.courseTitle}. Salle: ${s.room}. Type: ${s.type}. Statut: ${s.status === 'annule' ? 'ANNULÉ' : 'CONFIRMÉ'}`
  };
}
