import { useState, useCallback, useEffect, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { AttendanceByStudent, AttendanceStatus } from '../domain/ProfessorAttendance';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface ProfessorWithClassroom {
  selectedCourseId: string;
  handleCreateReminder: (content: string, isUrgent: boolean) => Promise<unknown>;
  handleCreateLesson: (title: string, description: string, attachmentName?: string, attachmentUrl?: string, moduleId?: string) => Promise<unknown>;
  handleCreateModule: (title: string, description: string) => Promise<unknown>;
}

export function useProfessorClassroomFormState(professor: ProfessorWithClassroom, triggerToast: (msg: string) => void) {
  const [remContent, setRemContent] = useState('');
  const [remIsUrgent, setRemIsUrgent] = useState(false);

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonAttachment, setLessonAttachment] = useState('');
  const [attendance, setAttendance] = useState<AttendanceByStudent>({});

  useEffect(() => {
    setAttendance({});
  }, [professor.selectedCourseId]);

  const submitAttendanceMutation = useMutation({
    mutationFn: async (payload: { date: string; courseId: string; studentId: string; status: string }[]) => {
      await apiClient.post('/prof/attendance/submit', payload);
    }
  });

  // Avant (jusqu'au 2026-11-10) : changement LOCAL seulement + « Présence mise à jour » → aucun appel n'était
  // jamais enregistré. Désormais : enregistré sur le serveur (date du jour), affiché seulement après succès.
  const handleMarkAttendance = useCallback(async (studentId: string, status: AttendanceStatus) => {
    const courseId = professor.selectedCourseId;
    if (!courseId) return;
    const statut = status === 'present' ? 'PRESENT' : status === 'retard' ? 'RETARD' : 'ABSENT';
    const aujourdhui = new Date();
    const date = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`;
    try {
      await submitAttendanceMutation.mutateAsync([{ date, courseId, studentId, status: statut }]);
      setAttendance((prev) => ({ ...prev, [studentId]: status }));
      triggerToast('Présence enregistrée');
    } catch (err) {
      triggerToast(resolveErrorMessage(err));
    }
  }, [professor.selectedCourseId, submitAttendanceMutation, triggerToast]);

  const handleReminderSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!remContent.trim()) {
      triggerToast('Veuillez saisir le contenu du rappel');
      return;
    }
    try {
      await professor.handleCreateReminder(remContent, remIsUrgent);
      setRemContent('');
      setRemIsUrgent(false);
      triggerToast('Rappel envoyé avec succès aux étudiants !');
    } catch (err) {
      triggerToast('Erreur de création du rappel');
    }
  }, [professor, remContent, remIsUrgent, triggerToast]);

  const handleLessonSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonDesc.trim()) {
      triggerToast('Veuillez saisir un titre et une description pour le cours');
      return;
    }
    try {
      await professor.handleCreateLesson(
        lessonTitle,
        lessonDesc,
        lessonAttachment.trim() || undefined,
        lessonAttachment.trim() ? '#' : undefined,
        activeModuleForLesson || undefined
      );
      setLessonTitle('');
      setLessonDesc('');
      setLessonAttachment('');
      setActiveModuleForLesson(null);
      triggerToast('Support de cours / leçon publié avec succès !');
    } catch (err) {
      triggerToast('Erreur de publication du cours');
    }
  }, [activeModuleForLesson, lessonAttachment, lessonDesc, lessonTitle, professor, triggerToast]);

  const handleModuleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) {
      triggerToast('Le titre du module/chapitre est requis');
      return;
    }
    try {
      await professor.handleCreateModule(newModuleTitle, newModuleDesc);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setIsAddingModule(false);
      triggerToast('Nouveau module de cours créé avec succès !');
    } catch (err) {
      triggerToast('Erreur lors de la création du module');
    }
  }, [newModuleDesc, newModuleTitle, professor, triggerToast]);

  return {
    remContent, setRemContent, remIsUrgent, setRemIsUrgent,
    isAddingModule, setIsAddingModule, newModuleTitle, setNewModuleTitle,
    newModuleDesc, setNewModuleDesc, activeModuleForLesson, setActiveModuleForLesson,
    lessonTitle, setLessonTitle, lessonDesc, setLessonDesc,
    lessonAttachment, setLessonAttachment, attendance, setAttendance,
    handleMarkAttendance, handleReminderSubmit, handleLessonSubmit, handleModuleSubmit,
  };
}
