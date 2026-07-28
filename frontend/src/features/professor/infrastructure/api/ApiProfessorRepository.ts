import { apiClient } from '@/shared/lib/apiClient';
import type { ProfessorRepository } from '../../domain/ProfessorRepository';
import type {
  ProfessorCourse, StudentEnrolled, StudentGrade,
  ProfessorHomework, ProfessorSchedule, VigilCheckIn,
  ClassroomReminder, ProfessorLesson, CourseModule, CourseQuiz, QuizQuestion
} from '../../domain/ProfessorModels';
import { ApiProfessorScheduleRepository } from './ApiProfessorScheduleRepository';

const scheduleRepo = new ApiProfessorScheduleRepository();

export class ApiProfessorRepository implements ProfessorRepository {
  async getCourses(profId: string): Promise<ProfessorCourse[]> { return scheduleRepo.getCourses(profId); }
  async getStudents(courseId: string): Promise<StudentEnrolled[]> { return scheduleRepo.getStudents(courseId); }
  async getGrades(courseId: string): Promise<StudentGrade[]> { return scheduleRepo.getGrades(courseId); }
  async updateGrade(courseId: string, studentId: string, cc: number, examen: number): Promise<StudentGrade> { return scheduleRepo.updateGrade(courseId, studentId, cc, examen); }
  async getHomeworks(courseId: string): Promise<ProfessorHomework[]> { return scheduleRepo.getHomeworks(courseId); }
  async createHomework(courseId: string, titre: string, desc: string, prio: 'haute' | 'normale', deadlineStr: string): Promise<ProfessorHomework> { return scheduleRepo.createHomework(courseId, titre, desc, prio, deadlineStr); }
  async getSchedule(profId: string): Promise<ProfessorSchedule[]> { return scheduleRepo.getSchedule(profId); }
  async cancelCourse(sessionId: string, reason: string): Promise<void> { return scheduleRepo.cancelCourse(sessionId, reason); }
  async rescheduleCourse(sessionId: string, day: string, time: string, room: string): Promise<void> { return scheduleRepo.rescheduleCourse(sessionId, day, time, room); }
  async getVigilCheckIns(): Promise<VigilCheckIn[]> { return scheduleRepo.getVigilCheckIns(); }
  async getReminders(courseId: string): Promise<ClassroomReminder[]> { return scheduleRepo.getReminders(courseId); }
  async createReminder(courseId: string, content: string, isUrgent: boolean): Promise<ClassroomReminder> { return scheduleRepo.createReminder(courseId, content, isUrgent); }

  async getLessons(courseId: string): Promise<ProfessorLesson[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/lessons`);
    return r.data;
  }

  async createLesson(courseId: string, title: string, description: string, attachmentName?: string, attachmentUrl?: string, moduleId?: string): Promise<ProfessorLesson> {
    const r = await apiClient.post(`/professor/courses/${courseId}/lessons`, { title, description, attachmentName, attachmentUrl, moduleId });
    return r.data;
  }

  async getModules(courseId: string): Promise<CourseModule[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/modules`);
    return r.data;
  }

  async createModule(courseId: string, title: string, description: string): Promise<CourseModule> {
    const r = await apiClient.post(`/professor/courses/${courseId}/modules`, { title, description });
    return r.data;
  }

  async getQuizzes(courseId: string): Promise<CourseQuiz[]> {
    const r = await apiClient.get(`/professor/courses/${courseId}/quizzes`);
    return r.data;
  }

  async createQuiz(moduleId: string, title: string, description: string, questions: QuizQuestion[]): Promise<CourseQuiz> {
    const r = await apiClient.post(`/professor/modules/${moduleId}/quizzes`, { title, description, questions });
    return r.data;
  }
}
