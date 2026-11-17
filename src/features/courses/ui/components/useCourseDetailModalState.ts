import { useState } from 'react';
import { CoursItem } from './types';
import { useRealCourseDetails, useHomeworkSubmission, initialHomeworkStatus } from './course-details/useRealCourseDetails';

export function useCourseDetailModalState(course: CoursItem, triggerToast: (msg: string) => void) {
  // Contenu chargé exclusivement depuis GET /student/courses/{id}/details (aucun contenu de secours).
  const { details, isLoadingDetails, detailsError } = useRealCourseDetails(course.id);
  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'quizzes' | 'homework'>('chapters');

  // Quiz : onglet autonome (CourseQuizzesTab), note et correction calculées par le serveur.

  // Remise des devoirs : statut « Soumis » uniquement après succès serveur
  const homework = useHomeworkSubmission(course.id, triggerToast, initialHomeworkStatus(details));

  return {
    details, isLoadingDetails, detailsError,
    activeTab, setActiveTab,
    uploadedFiles: homework.uploadedFiles, setUploadedFiles: homework.setUploadedFiles,
    uploadingId: homework.uploadingId, uploadProgress: homework.uploadProgress,
    homeworkStatus: homework.homeworkStatus, setHomeworkStatus: homework.setHomeworkStatus,
    handleFileChange: homework.handleFileChange
  };
}
