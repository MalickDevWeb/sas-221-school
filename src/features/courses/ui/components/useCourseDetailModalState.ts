import { useState } from 'react';
import { CoursItem } from './types';
import { useRealCourseDetails, useHomeworkSubmission, initialHomeworkStatus } from './course-details/useRealCourseDetails';

export function useCourseDetailModalState(course: CoursItem, triggerToast: (msg: string) => void) {
  // Contenu chargé exclusivement depuis GET /student/courses/{id}/details (aucun contenu de secours).
  const { details, isLoadingDetails, detailsError } = useRealCourseDetails(course.id);
  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'quizzes' | 'homework'>('chapters');

  // Quiz interactive state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizValidated, setQuizValidated] = useState(false);

  // Remise des devoirs : statut « Soumis » uniquement après succès serveur
  const homework = useHomeworkSubmission(course.id, triggerToast, initialHomeworkStatus(details));

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (quizValidated) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleValidateQuiz = () => {
    if (details.quizzes.length === 0) {
      triggerToast("Aucun quiz disponible pour ce cours.");
      return;
    }
    if (Object.keys(selectedAnswers).length < details.quizzes.length) {
      triggerToast("Veuillez répondre à toutes les questions avant de valider !");
      return;
    }
    setQuizValidated(true);
    let correctCount = 0;
    details.quizzes.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.reponseCorrecte) correctCount++;
    });
    triggerToast(`Quiz terminé ! Score : ${correctCount}/${details.quizzes.length}`);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizValidated(false);
  };

  return {
    details, isLoadingDetails, detailsError,
    activeTab, setActiveTab,
    selectedAnswers, quizValidated,
    uploadedFiles: homework.uploadedFiles, setUploadedFiles: homework.setUploadedFiles,
    uploadingId: homework.uploadingId, uploadProgress: homework.uploadProgress,
    homeworkStatus: homework.homeworkStatus, setHomeworkStatus: homework.setHomeworkStatus,
    handleSelectOption, handleValidateQuiz, handleResetQuiz, handleFileChange: homework.handleFileChange
  };
}
