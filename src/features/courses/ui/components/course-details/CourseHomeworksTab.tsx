import React from 'react';
import { HomeworkUploadZone } from './HomeworkUploadZone';

interface Homework { id: string; titre: string; dateLimite: string; points: string; }

export function CourseHomeworksTab({
  details, homeworkStatus, uploadedFiles, uploadingId, uploadProgress,
  handleFileChange, setUploadedFiles, setHomeworkStatus, triggerToast
}: {
  details: { devoirs: Homework[] };
  homeworkStatus: Record<string, 'A rendre' | 'Soumis'>;
  uploadedFiles: Record<string, { name: string; size: string }>;
  uploadingId: string | null;
  uploadProgress: number;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  setUploadedFiles: React.Dispatch<React.SetStateAction<Record<string, { name: string; size: string }>>>;
  setHomeworkStatus: React.Dispatch<React.SetStateAction<Record<string, 'A rendre' | 'Soumis'>>>;
  triggerToast: (msg: string) => void;
}) {
  const handleRetract = (id: string) => {
    setUploadedFiles(prev => { const c = { ...prev }; delete c[id]; return c; });
    setHomeworkStatus(prev => ({ ...prev, [id]: 'A rendre' }));
    triggerToast("La soumission du devoir a été annulée.");
  };

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      <div className="bg-white border border-neutral-gray-250 p-5 rounded-3xl space-y-4">
        <div>
          <h5 className="font-black text-xs text-[#3f1e1e] uppercase tracking-wider flex items-center gap-1.5">
            <span translate="no" className="material-symbols-outlined text-base">upload_file</span>
            Remise des Travaux Dirigés (TD/TP)
          </h5>
          <p className="text-[10px] text-neutral-500 font-bold">Déposez vos livrables ou devoirs avant la date limite.</p>
        </div>

        <div className="space-y-4">
          {details.devoirs.map((dev) => (
            <div key={dev.id} className="bg-[#FAF9F7] rounded-2xl p-4 border border-neutral-gray-250 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-gray-200/60 pb-3">
                <div>
                  <h6 className="text-xs font-black text-[#291715]">{dev.titre}</h6>
                  <div className="flex flex-wrap gap-2 text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">
                    <span>Limite : {dev.dateLimite} • Barème : {dev.points}</span>
                  </div>
                </div>
                <span className={`self-start sm:self-center text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${homeworkStatus[dev.id] === 'Soumis' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {homeworkStatus[dev.id] === 'Soumis' ? '🟢 Soumis' : '⏳ À Rendre'}
                </span>
              </div>
              <HomeworkUploadZone
                homeworkId={dev.id}
                uploaded={uploadedFiles[dev.id]}
                uploadingId={uploadingId}
                uploadProgress={uploadProgress}
                onFileChange={handleFileChange}
                onRetract={handleRetract}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
