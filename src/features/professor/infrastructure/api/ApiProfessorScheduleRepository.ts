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
import { listeBrute, objetBrut, texte, nombreOuNull, ObjetBrut } from '@/shared/lib/lectureServeur';

/** Statut d'une note : « Non noté » tant que la note finale manque. */
function statutNote(g: ObjetBrut, finale: number | null): StudentGrade['status'] {
  if (finale === null) return 'Non noté';
  return finale >= 10 || ['A', 'B', 'C'].includes(texte(g.mention)) ? 'Validé' : 'Rattrapage';
}

function versNote(g: ObjetBrut, courseId: string, studentIdDefaut = ''): StudentGrade {
  const finale = nombreOuNull(g.finalGrade);
  const studentId = texte(g.studentId) || studentIdDefaut;
  return {
    id: texte(g.id) || `grade-${studentId}`,
    studentId,
    studentNom: (g.prenom || g.nom) ? `${texte(g.prenom)} ${texte(g.nom)}`.trim() : (texte(g.studentNom) || 'Étudiant'),
    courseId: texte(g.courseId) || courseId,
    cc: nombreOuNull(g.cc),
    examen: nombreOuNull(g.examen),
    finalGrade: finale,
    status: statutNote(g, finale),
  };
}

function mapStudentList(raw: unknown): StudentEnrolled[] {
  return listeBrute(raw).map((s) => {
    // le serveur envoie firstName / lastName / fullName
    let prenom = texte(s.prenom || s.firstName);
    let nom = texte(s.nom || s.lastName);
    const complet = texte(s.name || s.fullName).trim();
    if (!prenom && !nom && complet) {
      const parts = complet.split(/\s+/);
      prenom = parts[0] || '';
      nom = parts.slice(1).join(' ') || '';
    }
    return { ...s, id: texte(s.id), matricule: texte(s.matricule), prenom, nom, email: texte(s.email) };
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

const TYPES_SEANCE: ProfessorSchedule['type'][] = ['CM', 'TP', 'TD'];

function mapScheduleList(raw: unknown): ProfessorSchedule[] {
  return listeBrute(raw).map((s) => {
    const brut = texte(s.day || s.jourComplet).trim();
    const type = texte(objetBrut(s.type).value ?? s.type).toUpperCase() as ProfessorSchedule['type'];
    const day = JOURS[brut.toUpperCase()] || (brut ? brut.charAt(0).toUpperCase() + brut.slice(1).toLowerCase() : '');
    return {
      id: texte(s.id),
      courseTitle: texte(s.courseTitle || s.nom) || '—',
      day, time: texte(s.time || s.heureStr) || '—',
      room: texte(s.room || s.salle) || '—',
      courseId: texte(s.courseId || s.course_id),
      type: TYPES_SEANCE.includes(type) ? type : 'CM',
      dateStr: texte(s.dateStr || s.date),
      status: statutSeance(s.status),
      cancellationReason: texte(s.cancellationReason),
      classe: texte(s.classe),
    };
  });
}

export class ApiProfessorScheduleRepository {
  async getCourses(profId: string): Promise<ProfessorCourse[]> {
    const r = await apiClient.get('/professor/courses', { params: { profId } });
    return listeBrute(r.data).map((c) => ({
      // Aucune valeur inventée : un champ absent côté serveur reste vide / « — »
      id: texte(c.id ?? c.code),
      titre: texte(c.titre || c.name || c.title) || '—',
      coefficient: nombreOuNull(c.coefficient) ?? undefined,
      progress: nombreOuNull(c.progress) ?? undefined,
      unites: Array.isArray(c.unites) ? c.unites.map(texte) : [],
      prochainCours: texte(c.prochainCours) || '—',
      salle: texte(c.salle) || '—',
      classe: texte(c.classe) || undefined
    }));
  }

  async getStudents(courseId: string): Promise<StudentEnrolled[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/students`);
    return mapStudentList(r.data);
  }

  async getGrades(courseId: string): Promise<StudentGrade[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/grades`);
    return listeBrute(r.data).map((g) => versNote(g, courseId));
  }

  async updateGrade(courseId: string, studentId: string, cc: number, examen: number): Promise<StudentGrade> {
    const r = await apiClient.post(`/professor/courses/${courseId}/grades/${studentId}`, { cc, examen });
    const g = objetBrut(r.data);
    const note = versNote(g, courseId, studentId);
    return { ...note, cc: note.cc ?? cc, examen: note.examen ?? examen };
  }

  async getHomeworks(courseId: string): Promise<ProfessorHomework[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/homeworks`);
    // aucune valeur inventée : champ absent = vide
    return listeBrute(r.data).map((h) => {
      const p = texte(objetBrut(h.prio).value ?? h.prio ?? objetBrut(h.priority).value ?? h.priority).toUpperCase();
      return {
        id: texte(h.id),
        titre: texte(h.titre || h.title) || '—',
        courseId: texte(h.courseId) || courseId,
        courseLabel: texte(h.courseLabel),
        desc: texte(h.desc || h.description),
        prio: ['HIGH', 'HAUTE', 'URGENT', 'URGENTE'].includes(p) ? 'haute' : 'normale',
        deadlineStr: texte(h.deadlineStr || h.deadline),
        submissionsCount: nombreOuNull(h.submissionsCount) ?? 0
      };
    });
  }

  async createHomework(courseId: string, titre: string, desc: string, prio: 'haute' | 'normale', deadlineStr: string): Promise<ProfessorHomework> {
    // priorité au format serveur
    await apiClient.post(`/professor/courses/${courseId}/homeworks`, { titre, desc, prio: prio === 'haute' ? 'HIGH' : 'MEDIUM', deadlineStr });
    // le serveur ne renvoie pas le devoir créé : on le relit (aucune donnée fabriquée côté écran)
    const devoirs = await this.getHomeworks(courseId);
    return devoirs.filter(d => d.titre === titre).pop() ?? devoirs[devoirs.length - 1];
  }

  async getSchedule(profId: string): Promise<ProfessorSchedule[]> {
    const r = await apiClient.get('/professor/schedule', { params: { profId } });
    return mapScheduleList(r.data);
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
    return listeBrute(r.data).map((x) => ({
      id: texte(x.id), courseId: texte(x.courseId) || courseId, content: texte(x.content), isUrgent: x.isUrgent === true,
      dateStr: texte(x.createdAt || x.dueDate).slice(0, 10),
    }));
  }

  async createReminder(courseId: string, content: string, isUrgent: boolean): Promise<ClassroomReminder> {
    const r = await apiClient.post(`/professor/courses/${courseId}/reminders`, { content, isUrgent });
    // rappel accepté par le serveur (identifiant réel) ; date du jour = date réelle de création
    return { id: texte(objetBrut(r.data).id), courseId, content, isUrgent, dateStr: new Date().toISOString().slice(0, 10) };
  }
}
