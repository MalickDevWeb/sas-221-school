import { apiClient } from '@/shared/lib/apiClient';
import type {
  ProfessorCourse,
  StudentEnrolled,
  StudentGrade,
  ProfessorHomework,
  ProfessorSchedule,
  VigilCheckIn,
  ClassroomReminder,
} from '../../domain/ProfessorModels';

function mapStudentList(list: any[]): StudentEnrolled[] {
  return list.map((s: any) => {
    let prenom = s.prenom || '';
    let nom = s.nom || '';
    if (!prenom && !nom && s.name) {
      const parts = s.name.trim().split(/\s+/);
      prenom = parts[0] || '';
      nom = parts.slice(1).join(' ') || '';
    }
    return { ...s, prenom, nom, email: s.email || `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s+/g, '')}@gmail.com` };
  });
}

function mapScheduleList(list: any[]): ProfessorSchedule[] {
  return list.map((s: any) => {
    let day = s.day || s.jourComplet || 'Lundi';
    if (day) day = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    return {
      id: s.id,
      courseTitle: s.courseTitle || s.nom || 'Cours',
      day, time: s.time || s.heureStr || '08:00 - 11:00',
      room: s.room || s.salle || 'Salle de classe',
      courseId: s.courseId || s.course_id || (s.nom?.includes('Sécurité') ? 'course-4' : 'course-1'),
      type: s.type || 'CM',
      dateStr: s.dateStr || 'Lundi 06 Juillet 2026',
      status: s.status || 'a_venir',
      cancellationReason: s.cancellationReason || '',
      classe: s.classe || 'M1 GL',
    };
  });
}

export class ApiProfessorScheduleRepository {
  async getCourses(profId: string): Promise<ProfessorCourse[]> {
    const r = await apiClient.get('/professor/courses', { params: { profId } });
    return r.data;
  }

  async getStudents(courseId: string): Promise<StudentEnrolled[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/students`);
    return mapStudentList(r.data || []);
  }

  async getGrades(courseId: string): Promise<StudentGrade[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/grades`);
    return r.data;
  }

  async updateGrade(courseId: string, studentId: string, cc: number, examen: number): Promise<StudentGrade> {
    const r = await apiClient.post(`/professor/courses/${courseId}/grades/${studentId}`, { cc, examen });
    return r.data;
  }

  async getHomeworks(courseId: string): Promise<ProfessorHomework[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/homeworks`);
    return r.data;
  }

  async createHomework(courseId: string, titre: string, desc: string, prio: 'haute' | 'normale', deadlineStr: string): Promise<ProfessorHomework> {
    const r = await apiClient.post(`/professor/courses/${courseId}/homeworks`, { titre, desc, prio, deadlineStr });
    return r.data;
  }

  async getSchedule(profId: string): Promise<ProfessorSchedule[]> {
    const r = await apiClient.get('/professor/schedule', { params: { profId } });
    return mapScheduleList(r.data || []);
  }

  async cancelCourse(sessionId: string, reason: string): Promise<void> {
    await apiClient.post(`/professor/schedule/${sessionId}/cancel`, { reason });
  }

  async rescheduleCourse(sessionId: string, day: string, time: string, room: string): Promise<void> {
    await apiClient.post(`/professor/schedule/${sessionId}/reschedule`, { day, time, room });
  }

  async getVigilCheckIns(): Promise<VigilCheckIn[]> {
    const r = await apiClient.get('/vigil/check-ins');
    return r.data;
  }

  async getReminders(courseId: string): Promise<ClassroomReminder[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/reminders`);
    return r.data;
  }

  async createReminder(courseId: string, content: string, isUrgent: boolean): Promise<ClassroomReminder> {
    const r = await apiClient.post(`/professor/courses/${courseId}/reminders`, { content, isUrgent });
    return r.data;
  }
}
