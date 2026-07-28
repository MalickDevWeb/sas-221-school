import { useState } from 'react';
import { COURSE_DETAILS, DEFAULT_COURSE_DETAILS } from './course-details/CourseDetailsData';
import { CoursItem } from './types';

export function useCourseDetailModalState(course: CoursItem, triggerToast: (msg: string) => void) {
  const details = COURSE_DETAILS[course.id] || DEFAULT_COURSE_DETAILS;
  const [activeTab, setActiveTab] = useState<'chapters' | 'resources' | 'quizzes' | 'homework'>('chapters');

  // Quiz interactive state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizValidated, setQuizValidated] = useState(false);

  // Homework state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string }>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [homeworkStatus, setHomeworkStatus] = useState<Record<string, 'A rendre' | 'Soumis'>>(() => {
    const initial: Record<string, 'A rendre' | 'Soumis'> = {};
    details.devoirs.forEach(dev => {
      initial[dev.id] = dev.statut;
    });
    return initial;
  });

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (quizValidated) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleValidateQuiz = () => {
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

  const simulateUpload = (homeworkId: string, fileName: string) => {
    if (uploadingId) return;
    setUploadingId(homeworkId);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadedFiles(prev => ({ ...prev, [homeworkId]: { name: fileName, size: "1.4 Mo" } }));
            setHomeworkStatus(prev => ({ ...prev, [homeworkId]: 'Soumis' }));
            setUploadingId(null);
            triggerToast("Devoir importé et remis avec succès !");
          }, 300);
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, homeworkId: string) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(homeworkId, e.target.files[0].name);
    }
  };

  return {
    details,
    activeTab, setActiveTab,
    selectedAnswers, quizValidated,
    uploadedFiles, setUploadedFiles, uploadingId, uploadProgress,
    homeworkStatus, setHomeworkStatus,
    handleSelectOption, handleValidateQuiz, handleResetQuiz, handleFileChange
  };
}
