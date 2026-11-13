import type { ProfessorSchedule } from '../domain/ProfessorModels';
import type { CourseSession } from '@/features/schedule/domain/Schedule';
import { decouperHoraire } from './scheduleFormatter';

const DAY_MAP: Record<string, 'LUN' | 'MAR' | 'MER' | 'JEU' | 'VEN'> = {
  'Lundi': 'LUN',
  'Mardi': 'MAR',
  'Mercredi': 'MER',
  'Jeudi': 'JEU',
  'Vendredi': 'VEN',
};

export function mapProfessorScheduleToCourseSession(s: ProfessorSchedule): CourseSession {
  // Horaire réel de la séance ; plus d'horaire inventé (08:00-10:00) quand le format n'était pas reconnu.
  const h = decouperHoraire(s.time);
  const start = h?.debut ?? '';
  const end = h?.fin ?? '';
  const mappedDay = DAY_MAP[s.day] || 'LUN';
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
    status: s.status === 'annule' ? 'termine' : 'a_venir',
    description: `Cours d'enseignement : ${s.courseTitle}. Salle: ${s.room}. Type: ${s.type}. Statut: ${s.status === 'annule' ? 'ANNULÉ' : 'CONFIRMÉ'}`
  };
}
