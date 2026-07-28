import type { ProfessorRepository } from '../../domain/ProfessorRepository';
import type { ProfessorCourse, StudentEnrolled, StudentGrade, ProfessorHomework, ProfessorSchedule, VigilCheckIn, ClassroomReminder, ProfessorLesson, CourseModule, CourseQuiz, QuizQuestion } from '../../domain/ProfessorModels';
import { MOCK_COURSES_TEACHER_1, MOCK_COURSES_TEACHER_2, MOCK_STUDENTS, MOCK_SCHEDULE_T1, MOCK_SCHEDULE_T2 } from './ProfessorMockData';
import { ProfessorStorage } from './ProfessorStorage';
import { INITIAL_SESSIONS, COURSE_CLASS_MAP } from './ProfessorSessionsMock';
import { isCourseInFuture, autoMarkPastDueCourses } from './ProfessorScheduleUtils';

export class InMemoryProfessorRepository implements ProfessorRepository {
  constructor() {
    if (!localStorage.getItem('p_migrated_to_l2_cm_v2')) {
      localStorage.removeItem('shared_school_sessions');
      localStorage.setItem('p_migrated_to_l2_cm_v2', 'true');
    }
    ProfessorStorage.getGrades(); ProfessorStorage.getHomeworks(); ProfessorStorage.getReminders();
    ProfessorStorage.getLessons(); ProfessorStorage.getModules(); ProfessorStorage.getQuizzes();
    if (!localStorage.getItem('shared_school_sessions')) {
      localStorage.setItem('shared_school_sessions', JSON.stringify(INITIAL_SESSIONS));
    }
  }

  async getCourses(profId: string): Promise<ProfessorCourse[]> {
    await new Promise(r => setTimeout(r, 100));
    return profId === 'usr-prof-02' ? MOCK_COURSES_TEACHER_2 : MOCK_COURSES_TEACHER_1;
  }

  async getStudents(_courseId: string): Promise<StudentEnrolled[]> {
    await new Promise(r => setTimeout(r, 100));
    return MOCK_STUDENTS;
  }

  async getGrades(courseId: string): Promise<StudentGrade[]> {
    await new Promise(r => setTimeout(r, 100));
    return ProfessorStorage.getGrades().filter(g => g.courseId === courseId);
  }

  async updateGrade(courseId: string, studentId: string, cc: number, examen: number): Promise<StudentGrade> {
    await new Promise(r => setTimeout(r, 100));
    const allGrades = ProfessorStorage.getGrades();
    const finalGrade = Math.round(((cc * 0.4) + (examen * 0.6)) * 10) / 10;
    const status = finalGrade >= 10 ? 'Validé' : 'Rattrapage';
    const index = allGrades.findIndex(g => g.courseId === courseId && g.studentId === studentId);
    let updatedGrade: StudentGrade;
    if (index >= 0) {
      updatedGrade = { ...allGrades[index], cc, examen, finalGrade, status };
      allGrades[index] = updatedGrade;
    } else {
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      updatedGrade = { id: `gr-${Date.now()}`, studentId, studentNom: student ? `${student.prenom} ${student.nom}` : 'Étudiant', courseId, cc, examen, finalGrade, status };
      allGrades.push(updatedGrade);
    }
    ProfessorStorage.saveGrades(allGrades);
    return updatedGrade;
  }

  async getHomeworks(courseId: string): Promise<ProfessorHomework[]> {
    await new Promise(r => setTimeout(r, 100));
    return ProfessorStorage.getHomeworks().filter(h => h.courseId === courseId);
  }

  async createHomework(courseId: string, titre: string, desc: string, prio: 'haute' | 'normale', deadlineStr: string): Promise<ProfessorHomework> {
    await new Promise(r => setTimeout(r, 100));
    const all = ProfessorStorage.getHomeworks();
    const newHw: ProfessorHomework = { id: `hw-${Date.now()}`, titre, courseId, courseLabel: 'Devoir', desc, prio, deadlineStr: `Jusqu'au ${deadlineStr}`, submissionsCount: 0 };
    ProfessorStorage.saveHomeworks([...all, newHw]);
    return newHw;
  }

  async getSchedule(profId: string): Promise<ProfessorSchedule[]> {
    await new Promise(r => setTimeout(r, 100));
    const saved = localStorage.getItem('shared_school_sessions');
    if (saved) {
      try {
        const sessions = autoMarkPastDueCourses(JSON.parse(saved));
        return sessions.filter((s: any) => s.profId === profId).map((s: any) => ({
          id: s.id, courseTitle: s.nom, day: s.jourComplet, time: s.heureStr, room: s.salle,
          type: s.type, status: s.status, cancellationReason: s.cancellationReason || '',
          dateStr: s.dateStr, jour: s.jour, courseId: s.courseId,
          classe: s.courseId ? (COURSE_CLASS_MAP[s.courseId] || 'L3-GL') : 'L3-GL'
        }));
      } catch {}
    }
    return profId === 'usr-prof-02' ? MOCK_SCHEDULE_T2 : MOCK_SCHEDULE_T1;
  }

  async cancelCourse(sessionId: string, reason: string): Promise<void> {
    const saved = localStorage.getItem('shared_school_sessions');
    if (!saved) return;
    const sessions = JSON.parse(saved);
    const idx = sessions.findIndex((s: any) => s.id === sessionId);
    if (idx > -1 && isCourseInFuture(sessions[idx].dateStr)) {
      sessions[idx] = { ...sessions[idx], status: 'annule', cancellationReason: reason };
      localStorage.setItem('shared_school_sessions', JSON.stringify(sessions));
    }
  }

  async rescheduleCourse(sessionId: string, day: string, time: string, room: string): Promise<void> {
    const saved = localStorage.getItem('shared_school_sessions');
    if (!saved) return;
    const sessions = JSON.parse(saved);
    const idx = sessions.findIndex((s: any) => s.id === sessionId);
    if (idx > -1) {
      sessions[idx] = { ...sessions[idx], status: 'a_venir', jourComplet: day, heureStr: time, salle: room, cancellationReason: '' };
      localStorage.setItem('shared_school_sessions', JSON.stringify(sessions));
    }
  }

  async getVigilCheckIns(): Promise<VigilCheckIn[]> {
    return [{ id: 'v1', name: 'Alioune Sall', studentId: 'student-001', statut: 'Autorisé', time: '07:55', date: new Date().toLocaleDateString('fr-FR'), type: 'Entrée' }];
  }

  async getReminders(courseId: string): Promise<ClassroomReminder[]> {
    return ProfessorStorage.getReminders().filter(r => r.courseId === courseId);
  }

  async createReminder(courseId: string, content: string, isUrgent: boolean): Promise<ClassroomReminder> {
    const all = ProfessorStorage.getReminders();
    const newRem: ClassroomReminder = { id: `rem-${Date.now()}`, courseId, content, dateStr: "À l'instant", isUrgent, room: 'Amphi A', salle: 'Amphi A' };
    ProfessorStorage.saveReminders([newRem, ...all]);
    return newRem;
  }

  async getLessons(courseId: string): Promise<ProfessorLesson[]> {
    return ProfessorStorage.getLessons().filter(l => l.courseId === courseId);
  }

  async createLesson(courseId: string, title: string, description: string, attachmentName?: string, attachmentUrl?: string, moduleId?: string): Promise<ProfessorLesson> {
    const all = ProfessorStorage.getLessons();
    const newLes: ProfessorLesson = { id: `les-${Date.now()}`, courseId, moduleId, title, description, dateStr: "À l'instant", attachmentName, attachmentUrl };
    ProfessorStorage.saveLessons([newLes, ...all]);
    return newLes;
  }

  async getModules(courseId: string): Promise<CourseModule[]> {
    return ProfessorStorage.getModules().filter(m => m.courseId === courseId);
  }

  async createModule(courseId: string, title: string, description: string): Promise<CourseModule> {
    const all = ProfessorStorage.getModules();
    const newMod: CourseModule = { id: `mod-${Date.now()}`, courseId, title, description };
    ProfessorStorage.saveModules([...all, newMod]);
    return newMod;
  }

  async getQuizzes(courseId: string): Promise<CourseQuiz[]> {
    const courseModuleIds = ProfessorStorage.getModules().filter(m => m.courseId === courseId).map(m => m.id);
    return ProfessorStorage.getQuizzes().filter(q => courseModuleIds.includes(q.moduleId));
  }

  async createQuiz(moduleId: string, title: string, description: string, questions: QuizQuestion[]): Promise<CourseQuiz> {
    const all = ProfessorStorage.getQuizzes();
    const newQuiz: CourseQuiz = { id: `quiz-${Date.now()}`, moduleId, title, description, questions };
    ProfessorStorage.saveQuizzes([...all, newQuiz]);
    return newQuiz;
  }
}
