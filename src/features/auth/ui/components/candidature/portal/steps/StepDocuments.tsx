import React from 'react';
import { motion } from 'motion/react';
import { DocumentsState } from '../admissionsTypes';

interface Props {
  docs: DocumentsState;
  simulateDocUpload: (key: keyof DocumentsState, label: string) => void;
  removeDoc: (key: keyof DocumentsState) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepDocuments({ docs, simulateDocUpload, removeDoc, onNext, onPrev }: Props) {
  const docList = [
    { key: 'idCard' as const, label: "Carte Nationale d'Identité (Recto/Verso) ou Passeport", required: true, icon: 'badge' },
    { key: 'diploma' as const, label: 'Attestation de Réussite ou Diplôme du Baccalauréat', required: true, icon: 'school' },
    { key: 'transcripts' as const, label: 'Relevé de notes du Bac ou Bulletins de Terminale', required: true, icon: 'description' },
    { key: 'photo' as const, label: "Photo d'Identité récente (Format officiel fond blanc)", required: false, icon: 'account_circle' }
  ];

  const uploadedCount = Object.values(docs).filter(Boolean).length;
  const progressPercent = Math.round((uploadedCount / docList.length) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-black text-neutral-900 tracking-tight">4. Dépôt des Pièces Justificatives</h3>
          <p className="text-xs text-neutral-500 font-medium">Formats acceptés : PDF, PNG, JPG (maximum 5 Mo par fichier).</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
          <span translate="no" className="material-symbols-outlined text-emerald-600 text-sm">cloud_done</span>
          <span className="text-[11px] font-black text-emerald-700">{uploadedCount}/4 pièces ({progressPercent}%)</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {docList.map(item => {
          const doc = docs[item.key];
          return (
            <div key={item.key} className={`p-3 rounded-2xl border transition-all ${doc ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${doc ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                    <span translate="no" className="material-symbols-outlined text-base">{doc ? 'check_circle' : item.icon}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800 leading-snug">{item.label}</h5>
                    {doc ? (
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{doc.name}</span> · {doc.size} · Validé ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">{item.required ? 'Obligatoire' : 'Facultatif'}</span>
                    )}
                  </div>
                </div>

                {doc ? (
                  <button type="button" onClick={() => removeDoc(item.key)} className="px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                    Remplacer
                  </button>
                ) : (
                  <button type="button" onClick={() => simulateDocUpload(item.key, item.label)} className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1 cursor-pointer">
                    <span translate="no" className="material-symbols-outlined text-xs">upload_file</span>
                    <span>Téléverser</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-neutral-100 flex justify-between">
        <button onClick={onPrev} className="h-11 px-5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
          <span translate="no" className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Précédent</span>
        </button>
        <button disabled={!docs.idCard || !docs.diploma} onClick={onNext} className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <span>Suivant : Frais de Dossier</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}

