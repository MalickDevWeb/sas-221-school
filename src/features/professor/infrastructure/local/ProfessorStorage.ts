import {
  DEFAULT_MODULES,
  DEFAULT_QUIZZES,
  DEFAULT_LESSONS,
  DEFAULT_REMINDERS,
  DEFAULT_GRADES,
  DEFAULT_HOMEWORKS
} from './ProfessorMockData';
import type { CourseModule, CourseQuiz, ProfessorLesson, StudentGrade, ProfessorHomework, ClassroomReminder } from '../../domain/ProfessorModels';

export const ProfessorStorage = {
  getModules: (): CourseModule[] => {
    const data = localStorage.getItem('p_modules');
    return data ? JSON.parse(data) : DEFAULT_MODULES;
  },
  saveModules: (modules: CourseModule[]) => {
    localStorage.setItem('p_modules', JSON.stringify(modules));
  },
  getQuizzes: (): CourseQuiz[] => {
    const data = localStorage.getItem('p_quizzes');
    return data ? JSON.parse(data) : DEFAULT_QUIZZES;
  },
  saveQuizzes: (quizzes: CourseQuiz[]) => {
    localStorage.setItem('p_quizzes', JSON.stringify(quizzes));
  },
  getLessons: (): ProfessorLesson[] => {
    const data = localStorage.getItem('p_lessons');
    return data ? JSON.parse(data) : DEFAULT_LESSONS;
  },
  saveLessons: (lessons: ProfessorLesson[]) => {
    localStorage.setItem('p_lessons', JSON.stringify(lessons));
  },
  getGrades: (): StudentGrade[] => {
    const data = localStorage.getItem('p_grades');
    return data ? JSON.parse(data) : DEFAULT_GRADES;
  },
  saveGrades: (grades: StudentGrade[]) => {
    localStorage.setItem('p_grades', JSON.stringify(grades));
  },
  getHomeworks: (): ProfessorHomework[] => {
    const data = localStorage.getItem('p_homeworks');
    return data ? JSON.parse(data) : DEFAULT_HOMEWORKS;
  },
  saveHomeworks: (hw: ProfessorHomework[]) => {
    localStorage.setItem('p_homeworks', JSON.stringify(hw));
  },
  getReminders: (): ClassroomReminder[] => {
    const data = localStorage.getItem('p_reminders');
    return data ? JSON.parse(data) : DEFAULT_REMINDERS;
  },
  saveReminders: (rem: ClassroomReminder[]) => {
    localStorage.setItem('p_reminders', JSON.stringify(rem));
  }
};
