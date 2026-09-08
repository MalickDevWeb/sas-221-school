import React from 'react';

interface UploadedFile { name: string; size: string; }

interface Props {
  readonly homeworkId: string;
  readonly uploaded: UploadedFile | undefined;
  readonly uploadingId: string | null;
  readonly uploadProgress: number;
  readonly onFileChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  readonly onRetract: (id: string) => void;
}

export function HomeworkUploadZone({ homeworkId, uploaded, uploadingId, uploadProgress, onFileChange, onRetract }: Props) {
  if (uploaded) {
    return (
      <div className="bg-white rounded-xl p-3 border border-neutral-gray-150 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-xs font-bold text-neutral-600 min-w-0">
          <span translate="no" className="material-symbols-outlined text-emerald-500 shrink-0">check_circle</span>
          <span className="truncate">{uploaded.name} ({uploaded.size})</span>
        </span>
        <button onClick={() => onRetract(homeworkId)} className="text-[9px] font-black text-red-500 hover:underline uppercase tracking-wider cursor-pointer font-sans">
          Retirer
        </button>
      </div>
    );
  }

  if (uploadingId === homeworkId) {
    return (
      <div className="bg-white rounded-xl p-4 border border-neutral-gray-150 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black text-neutral-500 uppercase tracking-wider">
          <span>Téléversement...</span><span>{uploadProgress}%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-red-deep rounded-full duration-100" style={{ width: `${uploadProgress}%` }} />
        </div>
      </div>
    );
  }

  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return (
      <div className="bg-red-50/70 border border-red-200/50 rounded-xl p-4 text-center space-y-1">
        <span className="material-symbols-outlined text-red-500 text-xl">error</span>
        <p className="text-[10px] font-extrabold text-red-800 uppercase tracking-wide">🚫 Action requise sur ordinateur</p>
        <p className="text-[9px] text-red-700 font-bold leading-normal">Veuillez utiliser un écran desktop pour téléverser vos pièces justificatives.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-dashed border-neutral-gray-350 p-6 text-center space-y-2 relative hover:bg-neutral-50/50 transition-colors">
      <input type="file" id={`file-${homeworkId}`} onChange={(e) => onFileChange(e, homeworkId)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
      <span translate="no" className="material-symbols-outlined text-neutral-400 text-3xl">upload_file</span>
      <p className="text-[11px] font-bold text-[#291715]">Glissez-déposez votre fichier ici, ou <span className="text-brand-red-deep underline">parcourez vos fichiers</span></p>
      <p className="text-[9px] text-neutral-400 font-bold">PDF, ZIP, RAR, PNG (Max 15 Mo)</p>
    </div>
  );
}
