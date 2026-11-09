import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { loadReminders } from './CourseDetailHelpers';
import { useRealCourseDetails, useHomeworkSubmission, initialHomeworkStatus } from './useRealCourseDetails';

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

  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'quizzes' | 'homework' | 'parcours'>('parcours');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizValidated, setQuizValidated] = useState(false);

  const homework = useHomeworkSubmission(course?.id ?? id, triggerToast, initialHomeworkStatus(details));

  const [courseReminders, setCourseReminders] = useState<any[]>([]);

  useEffect(() => {
    const loadRem = () => setCourseReminders(loadReminders(id ?? '', course?.id, id));
    loadRem();
    const interval = setInterval(loadRem, 2000);
    return () => clearInterval(interval);
  }, [id, course]);

  const handleSelectOption = (qIdx: number, oIdx: number) => {
    if (!quizValidated) setSelectedAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleValidateQuiz = () => {
    if (details.quizzes.length === 0) return triggerToast("Aucun quiz disponible pour ce cours.");
    if (Object.keys(selectedAnswers).length < details.quizzes.length) {
      return triggerToast("Veuillez répondre à toutes les questions avant de valider !");
    }
    setQuizValidated(true);
    const correct = details.quizzes.filter((q, idx) => selectedAnswers[idx] === q.reponseCorrecte).length;
    triggerToast(`Quiz terminé ! Score : ${correct}/${details.quizzes.length}`);
  };

  return {
    navigate, course, details, detailsError, isLoading, showToast, activeTab, setActiveTab,
    selectedAnswers, quizValidated,
    uploadedFiles: homework.uploadedFiles, setUploadedFiles: homework.setUploadedFiles,
    uploadingId: homework.uploadingId, uploadProgress: homework.uploadProgress,
    homeworkStatus: homework.homeworkStatus, setHomeworkStatus: homework.setHomeworkStatus, courseReminders,
    handleSelectOption, handleValidateQuiz, handleResetQuiz: () => { setSelectedAnswers({}); setQuizValidated(false); },
    handleFileChange: homework.handleFileChange,
    triggerToast
  };
}
