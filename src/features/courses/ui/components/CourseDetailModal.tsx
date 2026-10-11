import React from 'react';
import { createPortal } from 'react-dom';
import { CoursItem } from './types';
import { CourseChaptersTab } from './course-details/CourseChaptersTab';
import { CourseResourcesTab } from './course-details/CourseResourcesTab';
import { CourseQuizzesTab } from './course-details/CourseQuizzesTab';
import { CourseHomeworksTab } from './course-details/CourseHomeworksTab';
import { useCourseDetailModalState } from './useCourseDetailModalState';
import { CourseDetailSidebar } from './CourseDetailSidebar';

interface CourseDetailModalProps {
  course: CoursItem;
  onClose: () => void;
  triggerToast: (msg: string) => void;
}

export function CourseDetailModal({ course, onClose, triggerToast }: CourseDetailModalProps) {
  const state = useCourseDetailModalState(course, triggerToast);
  const {
    details, activeTab, setActiveTab,
    selectedAnswers, quizValidated,
    uploadedFiles, setUploadedFiles, uploadingId, uploadProgress,
    homeworkStatus, setHomeworkStatus,
    handleSelectOption, handleValidateQuiz, handleResetQuiz, handleFileChange
  } = state;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#291715]/75 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div id="course-workspace-container" className="bg-[#FAF9F7] rounded-[32px] w-full max-w-5xl h-[95vh] md:h-[85vh] max-h-[820px] overflow-hidden shadow-2xl border border-neutral-gray-200 flex flex-col animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Banner with course name, category, and close buttons */}
        <div className="relative h-32 md:h-40 bg-neutral-gray-900 shrink-0 select-none">
          <img className="w-full h-full object-cover opacity-60" src={course.image} alt={course.nom} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#291715] via-[#291715]/40 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 text-white hover:bg-white/20 bg-black/30 p-2.5 rounded-full transition-all cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-lg bg-[#E3A857] text-[#291715] text-[10px] font-black uppercase tracking-wider shadow-xs">{course.categorie}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/25 text-white text-[9px] font-black uppercase tracking-wider">{course.volumeHoraire || "30 Heures"}</span>
              </div>
              <h4 className="text-xl md:text-2xl font-black leading-tight tracking-tight uppercase drop-shadow-md">{course.nom}</h4>
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/10 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-wider text-white">Professeur : <span className="text-[#E3A857]">{course.professeur}</span></p>
            </div>
          </div>
        </div>

        {/* Workspace Dual Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <CourseDetailSidebar course={course} details={details} />

          {/* Main Content Workspace Panel */}
          <div className="flex-grow flex flex-col overflow-hidden min-h-0 bg-[#FAF9F7]/30">
            {/* Custom Tab Switchers */}
            <div className="flex border-b border-neutral-gray-200 bg-white shrink-0">
              <button onClick={() => setActiveTab('chapters')} className={`flex-1 py-4 text-center font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'chapters' ? 'border-brand-red-deep text-brand-red-deep bg-[#FFF8F7]/30' : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-[#FAF9F7]/50'}`}>
                <span translate="no" className="material-symbols-outlined text-lg">auto_stories</span> Détails & Progression
              </button>
              <button onClick={() => setActiveTab('resources')} className={`flex-1 py-4 text-center font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'resources' ? 'border-brand-red-deep text-brand-red-deep bg-[#FFF8F7]/30' : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-[#FAF9F7]/50'}`}>
                <span translate="no" className="material-symbols-outlined text-lg">folder_open</span> Ressources ({details.ressources.length})
              </button>
              <button onClick={() => setActiveTab('quizzes')} className={`flex-1 py-4 text-center font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'quizzes' ? 'border-brand-red-deep text-brand-red-deep bg-[#FFF8F7]/30' : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-[#FAF9F7]/50'}`}>
                <span translate="no" className="material-symbols-outlined text-lg">quiz</span> Quiz Évaluation
              </button>
              <button onClick={() => setActiveTab('homework')} className={`flex-1 py-4 text-center font-black uppercase tracking-wider text-[10px] sm:text-xs transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'homework' ? 'border-brand-red-deep text-brand-red-deep bg-[#FFF8F7]/30' : 'border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-[#FAF9F7]/50'}`}>
                <span translate="no" className="material-symbols-outlined text-lg">upload_file</span> Rendu devoirs
              </button>
            </div>

            {/* Scrollable Work Area */}
            <div className="flex-1 p-5 md:p-6 overflow-y-auto min-h-0 space-y-5 no-scrollbar">
              {activeTab === 'chapters' && <CourseChaptersTab state={{ course, details }} />}
              {activeTab === 'resources' && <CourseResourcesTab course={course} details={details} triggerToast={triggerToast} />}
              {activeTab === 'quizzes' && (
                <CourseQuizzesTab
                  details={details}
                  selectedAnswers={selectedAnswers}
                  handleSelectOption={handleSelectOption}
                  quizValidated={quizValidated}
                  handleValidateQuiz={handleValidateQuiz}
                  handleResetQuiz={handleResetQuiz}
                />
              )}
              {activeTab === 'homework' && (
                <CourseHomeworksTab
                  details={details}
                  uploadedFiles={uploadedFiles}
                  uploadingId={uploadingId}
                  uploadProgress={uploadProgress}
                  homeworkStatus={homeworkStatus}
                  handleFileChange={handleFileChange}
                  setUploadedFiles={state.setUploadedFiles}
                  setHomeworkStatus={state.setHomeworkStatus}
                  triggerToast={triggerToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
