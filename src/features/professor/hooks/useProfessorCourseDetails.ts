import { useState, useEffect } from 'react';
import { 
  getGradesUseCase,
  getHomeworksUseCase,
  getRemindersUseCase,
  getLessonsUseCase,
  getModulesUseCase,
  getQuizzesUseCase,
  getStudentsUseCase
} from '../infrastructure/config/dependencies';
import type { 
  StudentGrade, 
  ProfessorHomework, 
  ClassroomReminder,
  ProfessorLesson,
  CourseModule,
  CourseQuiz,
  StudentEnrolled
} from '../domain/ProfessorModels';

export function useProfessorCourseDetails(selectedCourseId: string) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [homeworks, setHomeworks] = useState<ProfessorHomework[]>([]);
  const [reminders, setReminders] = useState<ClassroomReminder[]>([]);
  const [lessons, setLessons] = useState<ProfessorLesson[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [quizzes, setCourseQuizzes] = useState<CourseQuiz[]>([]);
  const [students, setStudents] = useState<StudentEnrolled[]>([]);

  useEffect(() => {
    if (!selectedCourseId) return;
    
    let isMounted = true;
    async function loadCourseDetails() {
      try {
        // chargements indépendants : un échec (ex. rappels) ne vide plus toute la salle de classe
        const id = selectedCourseId as string;
        const r = await Promise.allSettled([
          getGradesUseCase(id), getHomeworksUseCase(id), getRemindersUseCase(id), getLessonsUseCase(id),
          getModulesUseCase(id), getQuizzesUseCase(id), getStudentsUseCase(id),
        ]);
        const val = <T,>(i: number, defaut: T): T => (r[i].status === 'fulfilled' ? (r[i] as PromiseFulfilledResult<T>).value : defaut);
        const loadedGrades = val<StudentGrade[]>(0, []);
        const loadedHomeworks = val<ProfessorHomework[]>(1, []);
        const loadedReminders = val<ClassroomReminder[]>(2, []);
        const loadedLessons = val<ProfessorLesson[]>(3, []);
        const loadedModules = val<CourseModule[]>(4, []);
        const loadedQuizzes = val<CourseQuiz[]>(5, []);
        const loadedStudents = val<StudentEnrolled[]>(6, []);
        r.forEach((x) => { if (x.status === 'rejected') console.warn('Salle de classe : chargement partiel', x.reason); });
        // TOUS les élèves de la classe figurent dans les notes, notés ou non (sinon, impossible de saisir une
        // première note)
        const notes = new Map(loadedGrades.map((g) => [g.studentId, g]));
        const fusion: StudentGrade[] = [
          ...loadedGrades,
          ...loadedStudents.filter((s) => !notes.has(s.id)).map((s): StudentGrade => ({
            id: '', studentId: s.id, studentNom: `${s.prenom || ''} ${s.nom || ''}`.trim() || s.email || s.id,
            courseId: id, cc: null, examen: null, finalGrade: null, status: 'Non noté',
          })),
        ];
        if (isMounted) {
          setGrades(fusion);
          setHomeworks(loadedHomeworks);
          setReminders(loadedReminders);
          setLessons(loadedLessons);
          setModules(loadedModules);
          setCourseQuizzes(loadedQuizzes);
          setStudents(loadedStudents);
        }
      } catch (err) {
        console.error("Erreur de chargement des détails du cours :", err);
      }
    }
    
    loadCourseDetails();
    return () => { isMounted = false; };
  }, [selectedCourseId]);

  return {
    grades,
    setGrades,
    homeworks,
    setHomeworks,
    reminders,
    setReminders,
    lessons,
    setLessons,
    modules,
    setModules,
    quizzes,
    setCourseQuizzes,
    students,
    setStudents
  };
}
