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
    // le serveur envoie firstName / lastName / fullName (avant : seuls prenom / nom / name étaient lus →
    // élèves affichés SANS NOM dans l'appel et les notes — test navigateur du 2026-11-10)
    let prenom = s.prenom || s.firstName || '';
    let nom = s.nom || s.lastName || '';
    const complet = s.name || s.fullName;
    if (!prenom && !nom && complet) {
      const parts = complet.trim().split(/\s+/);
      prenom = parts[0] || '';
      nom = parts.slice(1).join(' ') || '';
    }
    return { ...s, prenom, nom, email: s.email || '' };
  });
}

/** Jours renvoyés par le serveur (MONDAY…) → libellés de l'écran (Lundi…). */
const JOURS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi', FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

/** Statut serveur (SCHEDULED, CANCELLED…, éventuellement { value }) → statut de l'écran. */
function statutSeance(brut: unknown): 'a_venir' | 'annule' | 'reprogramme' | 'non_fait' {
  const v = String((brut as { value?: string })?.value ?? brut ?? '').toUpperCase();
  if (['CANCELLED', 'ANNULE', 'ANNULEE'].includes(v)) return 'annule';
  if (['RESCHEDULED', 'REPORTE', 'REPROGRAMME'].includes(v)) return 'reprogramme';
  if (['COMPLETED', 'TERMINE'].includes(v)) return 'non_fait';
  return 'a_venir';
}

/**
 * Avant (jusqu'au 2026-11-10) : « MONDAY » devenait « Monday » → aucune séance placée (emploi du temps vide),
 * et les champs absents étaient remplis avec des valeurs inventées (« 08:00 - 11:00 », « Salle de classe »,
 * « Lundi 06 Juillet 2026 », classe « M1 GL », cours « course-1 »).
 */
function mapScheduleList(list: any[]): ProfessorSchedule[] {
  return list.map((s: any) => {
    const brut = String(s.day || s.jourComplet || '').trim();
    const day = JOURS[brut.toUpperCase()] || (brut ? brut.charAt(0).toUpperCase() + brut.slice(1).toLowerCase() : '');
    return {
      id: s.id,
      courseTitle: s.courseTitle || s.nom || '—',
      day, time: s.time || s.heureStr || '—',
      room: s.room || s.salle || '—',
      courseId: s.courseId || s.course_id || '',
      type: (s.type?.value ?? s.type) || 'CM',
      dateStr: s.dateStr || s.date || '',
      status: statutSeance(s.status),
      cancellationReason: s.cancellationReason || '',
      classe: s.classe || '',
    };
  });
}

export class ApiProfessorScheduleRepository {
  async getCourses(profId: string): Promise<ProfessorCourse[]> {
    const r = await apiClient.get('/professor/courses', { params: { profId } });
    const items = Array.isArray(r.data) ? r.data : (r.data?.content || []);
    return items.map((c: any) => ({
      // Aucune valeur inventée : un champ absent côté serveur reste vide / « — »
      id: String(c.id ?? c.code ?? ''),
      titre: c.titre || c.name || c.title || '—',
      coefficient: typeof c.coefficient === 'number' ? c.coefficient : undefined,
      progress: typeof c.progress === 'number' ? c.progress : undefined,
      unites: Array.isArray(c.unites) ? c.unites : [],
      prochainCours: c.prochainCours || '—',
      salle: c.salle || '—',
      classe: c.classe || undefined
    }));
  }

  async getStudents(courseId: string): Promise<StudentEnrolled[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/students`);
    return mapStudentList(r.data || []);
  }

  async getGrades(courseId: string): Promise<StudentGrade[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/grades`);
    const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
    return list.map((g: any) => ({
      id: g.id || `grade-${g.studentId}`,
      studentId: g.studentId,
      studentNom: (g.prenom || g.nom) ? `${g.prenom || ''} ${g.nom || ''}`.trim() : (g.studentNom || 'Étudiant'),
      courseId: g.courseId || courseId,
      cc: g.cc ?? 0,
      examen: g.examen ?? 0,
      finalGrade: g.finalGrade ?? 0,
      status: (g.finalGrade >= 10 || g.mention === 'A' || g.mention === 'B' || g.mention === 'C') ? 'Validé' : 'Rattrapage'
    }));
  }

  async updateGrade(courseId: string, studentId: string, cc: number, examen: number): Promise<StudentGrade> {
    const r = await apiClient.post(`/professor/courses/${courseId}/grades/${studentId}`, { cc, examen });
    const g = r.data;
    return {
      id: g.id || `grade-${studentId}`,
      studentId: g.studentId || studentId,
      studentNom: (g.prenom || g.nom) ? `${g.prenom || ''} ${g.nom || ''}`.trim() : (g.studentNom || 'Étudiant'),
      courseId: g.courseId || courseId,
      cc: g.cc ?? cc,
      examen: g.examen ?? examen,
      finalGrade: g.finalGrade ?? 0,
      status: (g.finalGrade >= 10 || g.mention === 'A' || g.mention === 'B' || g.mention === 'C') ? 'Validé' : 'Rattrapage'
    };
  }

  async getHomeworks(courseId: string): Promise<ProfessorHomework[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/homeworks`);
    const list = Array.isArray(r.data) ? r.data : (r.data?.content || []);
    // plus de valeurs inventées (« Devoir », « Cours », échéance « 2026-10-15 ») : champ absent = vide
    return list.map((h: any) => {
      const p = String(h.prio?.value ?? h.prio ?? h.priority?.value ?? h.priority ?? '').toUpperCase();
      return {
        id: h.id,
        titre: h.titre || h.title || '—',
        courseId: h.courseId || courseId,
        courseLabel: h.courseLabel || '',
        desc: h.desc || h.description || '',
        prio: ['HIGH', 'HAUTE', 'URGENT', 'URGENTE'].includes(p) ? 'haute' : 'normale',
        deadlineStr: h.deadlineStr || h.deadline || '',
        submissionsCount: h.submissionsCount ?? 0
      };
    });
  }

  async createHomework(courseId: string, titre: string, desc: string, prio: 'haute' | 'normale', deadlineStr: string): Promise<ProfessorHomework> {
    // priorité au format serveur (avant : « normale » était refusée → devoir impossible à créer)
    await apiClient.post(`/professor/courses/${courseId}/homeworks`, { titre, desc, prio: prio === 'haute' ? 'HIGH' : 'MEDIUM', deadlineStr });
    // le serveur ne renvoie pas le devoir créé : on le relit (aucune donnée fabriquée côté écran)
    const devoirs = await this.getHomeworks(courseId);
    return devoirs.filter(d => d.titre === titre).pop() ?? devoirs[devoirs.length - 1];
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
    const liste = Array.isArray(r.data) ? r.data : (r.data?.content || []);
    return liste.map((x: any) => ({
      id: x.id, courseId: x.courseId || courseId, content: x.content || '', isUrgent: !!x.isUrgent,
      dateStr: String(x.createdAt || x.dueDate || '').slice(0, 10),
    }));
  }

  async createReminder(courseId: string, content: string, isUrgent: boolean): Promise<ClassroomReminder> {
    const r = await apiClient.post(`/professor/courses/${courseId}/reminders`, { content, isUrgent });
    // rappel accepté par le serveur (identifiant réel) ; date du jour = date réelle de création
    return { id: r.data?.id, courseId, content, isUrgent, dateStr: new Date().toISOString().slice(0, 10) };
  }
}
