import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { DocumentsState } from '../admissionsTypes';

interface Props {
  docs: DocumentsState;
  uploadDoc: (key: keyof DocumentsState, file: File) => Promise<void>;
  uploadingDoc?: string | null;
  uploadProgress?: number;
  simulateDocUpload: (key: keyof DocumentsState, label: string) => void;
  removeDoc: (key: keyof DocumentsState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepDocuments({ docs, uploadDoc, uploadingDoc, uploadProgress = 0, simulateDocUpload, removeDoc, onNext, onPrev }: Props) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const docList = [
    { key: 'idCard' as const, label: "Carte Nationale d'Identité ou Passeport", required: true, icon: 'solar:user-id-bold-duotone' },
    { key: 'diploma' as const, label: 'Attestation de Réussite ou Diplôme du Bac', required: true, icon: 'solar:diploma-bold-duotone' },
    { key: 'transcripts' as const, label: 'Relevé de notes du Bac ou Bulletins', required: true, icon: 'solar:notes-bold-duotone' },
    { key: 'photo' as const, label: "Photo d'Identité récente (fond blanc)", required: false, icon: 'solar:user-circle-bold-duotone' }
  ];

  const uploadedCount = Object.values(docs).filter(Boolean).length;
  const progressPercent = Math.round((uploadedCount / docList.length) * 100);

  const handleFileChange = (key: keyof DocumentsState, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadDoc(key, file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-black text-neutral-900 tracking-tight">4. Dépôt des Pièces Justificatives</h3>
          <p className="text-xs text-neutral-500 font-medium">Formats : PDF, PNG, JPG (stockage Cloudinary certifié).</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
          <Icon icon="solar:cloud-check-bold" className="text-emerald-600 text-base" />
          <span className="text-[11px] font-black text-emerald-700">{uploadedCount}/4 pièces ({progressPercent}%)</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {docList.map(item => {
          const doc = docs[item.key];
          const isUploading = uploadingDoc === item.key;
          return (
            <div key={item.key} className={`p-3 rounded-2xl border transition-all ${doc ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'}`}>
              <input ref={el => { fileInputRefs.current[item.key] = el; }} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => handleFileChange(item.key, e)} />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${doc ? 'bg-emerald-600 text-white' : isUploading ? 'bg-primary text-white animate-pulse' : 'bg-neutral-200 text-neutral-600'}`}>
                    <Icon icon={doc ? 'solar:check-circle-bold' : isUploading ? 'solar:cloud-upload-bold-duotone' : item.icon} className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-neutral-800 leading-snug truncate">{item.label}</h5>
                    {isUploading ? (
                      <div className="space-y-1 mt-1">
                        <span className="text-[10px] text-primary font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                          <span>Téléversement Cloudinary : {uploadProgress}%</span>
                        </span>
                        <div className="w-32 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div className="bg-primary h-full transition-all duration-200 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : doc ? (
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <span className="font-mono truncate">{doc.name}</span> · {doc.size} · Cloudinary <Icon icon="solar:check-read-bold" className="text-emerald-600 text-xs inline" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">{item.required ? 'Obligatoire' : 'Facultatif'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc ? (
                    <div className="flex items-center gap-1">
                      {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="px-2 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg">Voir</a>}
                      <button type="button" onClick={() => removeDoc(item.key)} className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">Remplacer</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button disabled={isUploading} type="button" onClick={() => fileInputRefs.current[item.key]?.click()} className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
                        <Icon icon="solar:upload-track-2-bold" className="text-sm" />
                        <span>{isUploading ? `${uploadProgress}%` : 'Téléverser'}</span>
                      </button>
                      <button type="button" title="Simulation rapide" onClick={() => simulateDocUpload(item.key, item.label)} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 cursor-pointer">
                        <Icon icon="solar:magic-stick-3-bold-duotone" className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <Icon icon="solar:arrow-left-line-duotone" className="text-base" />
          <span>Précédent</span>
        </button>
        <button disabled={!docs.idCard || !docs.diploma} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Frais de Dossier</span>
          <Icon icon="solar:arrow-right-line-duotone" className="text-base" />
        </button>
      </div>
    </motion.div>
  );
}
