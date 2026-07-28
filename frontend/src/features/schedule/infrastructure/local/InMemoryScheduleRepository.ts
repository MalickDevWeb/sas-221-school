import { CourseSession } from '../../domain/Schedule';
import { ScheduleRepository } from '../../domain/ScheduleRepository';

import { MOCK_SCHEDULE } from './ScheduleMockData';

export class InMemoryScheduleRepository implements ScheduleRepository {
  async getWeeklySchedule(): Promise<CourseSession[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const saved = localStorage.getItem('shared_school_sessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved);
        return sessions.map((s: any) => ({
          id: s.id,
          nom: s.nom,
          jour: s.jour,
          jourComplet: s.jourComplet.toUpperCase(),
          dateStr: s.dateStr,
          heureDebut: s.heureDebut,
          heureFin: s.heureFin,
          heureStr: s.heureStr,
          type: s.type,
          salle: s.salle,
          professeur: s.professeur,
          description: s.description || '',
          status: s.status,
          cancellationReason: s.cancellationReason || ''
        }));
      } catch (err) {
        console.error("Failed parsing shared_school_sessions for student:", err);
      }
    }
    return MOCK_SCHEDULE;
  }
}
