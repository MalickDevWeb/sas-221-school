import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { loadReminders } from './CourseDetailHelpers';
import { useRealCourseDetails, useHomeworkSubmission, initialHomeworkStatus } from './useRealCourseDetails';
import type { CourseRemindersList } from './CourseRemindersList';

type RappelCours = Parameters<typeof CourseRemindersList>[0]['reminders'][number];

export function useCourseDetailState() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, isLoading: isLoadingCourses } = useCourses();

  // Uniquement les cours réels renvoyés par GET /student/courses.
  const course = id ? courses.find(c => c.id === id) : undefined;
  const { details, isLoadingDetails, detailsError } = useRealCourseDetails(course?.id ?? id);
  const isLoading = isLoadingCourses || isLoadingDetails;

  const [showToast, setShowToast] = useState<string | null>(null);
  const triggerToast = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 3000);
  };

  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'quizzes' | 'homework'>('chapters');

  const homework = useHomeworkSubmission(course?.id ?? id, triggerToast, initialHomeworkStatus(details));

  const [courseReminders, setCourseReminders] = useState<RappelCours[]>([]);

  useEffect(() => {
    const loadRem = () => setCourseReminders(loadReminders(id ?? '', course?.id, id));
    loadRem();
    const interval = setInterval(loadRem, 2000);
    return () => clearInterval(interval);
  }, [id, course]);

  // Quiz : onglet autonome (CourseQuizzesTab) branché sur /student/courses/{id}/quizzes et les tentatives ;
  // aucune bonne réponse ni note calculée ici.

  return {
    navigate, course, details, detailsError, isLoading, showToast, activeTab, setActiveTab,
    uploadedFiles: homework.uploadedFiles, setUploadedFiles: homework.setUploadedFiles,
    uploadingId: homework.uploadingId, uploadProgress: homework.uploadProgress,
    homeworkStatus: homework.homeworkStatus, setHomeworkStatus: homework.setHomeworkStatus, courseReminders,
    handleFileChange: homework.handleFileChange,
    triggerToast
  };
}
