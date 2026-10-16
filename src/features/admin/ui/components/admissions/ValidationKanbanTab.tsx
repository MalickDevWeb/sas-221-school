import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { CandidateAdmissionBadge } from './CandidateAdmissionBadge';
import { CandidateDetailModal } from './CandidateDetailModal';

interface Props {
  candidates: ExtendedCandidate[];
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function ValidationKanbanTab({ candidates, onUpdateCandidate }: Props) {
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const columns: { id: ExtendedCandidate['step']; label: string; bg: string; border: string; text: string }[] = [
    { id: 'new', label: 'Nouveau Dossier', bg: 'bg-neutral-50/50', border: 'border-neutral-200', text: 'text-neutral-500' },
    { id: 'docs', label: 'Pièces Vérifiées', bg: 'bg-amber-50/20', border: 'border-amber-100', text: 'text-amber-600' },
    { id: 'admitted', label: 'Admis d\'office', bg: 'bg-emerald-50/20', border: 'border-emerald-100', text: 'text-emerald-600' },
    { id: 'rejected', label: 'Dossier Rejeté', bg: 'bg-rose-50/20', border: 'border-rose-100', text: 'text-rose-600' },
  ];

  const filteredCandidates = filterType === 'ALL'
    ? candidates
    : candidates.filter(c => c.type === filterType);

  return (
    <div className="space-y-4" id="validation-kanban-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Espace Candidatures & Validation des Dossiers</h3>
          <p className="text-[10px] text-neutral-400 font-semibold">
            Cliquez sur un candidat pour ouvrir son dossier, vérifier sa CNI, confirmer son paiement ou prononcer son admission.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#1E293B] text-[11px]">Filtre :</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-[#FAF8F6] border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-700 cursor-pointer outline-none font-semibold"
          >
            <option value="ALL">Tous les types ({candidates.length})</option>
            <option value="BAC">Nouveau Bachelier (L1)</option>
            <option value="TRANSFER">Transfert Universitaire</option>
            <option value="REINSCRIPTION">Réinscription</option>
            <option value="INT">Étudiant International</option>
            <option value="VAE">Validation Acquis (VAE)</option>
            <option value="EXCEPT">Admission Exceptionnelle</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        {columns.map(col => {
          const list = filteredCandidates.filter(c => c.step === col.id);
          return (
            <div key={col.id} className={`${col.bg} border ${col.border} rounded-2xl p-4 flex flex-col space-y-3 min-h-[420px]`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                <span className={`text-[10px] font-black uppercase tracking-wider ${col.text}`}>{col.label}</span>
                <span className="text-[10px] font-black bg-white border border-neutral-200 px-2 py-0.5 rounded text-neutral-500">{list.length}</span>
              </div>

              <div className="flex-grow space-y-2.5 overflow-y-auto max-h-[350px] no-scrollbar">
                {list.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className="bg-white border border-neutral-200 hover:border-primary p-3 rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-extrabold text-xs text-[#1E293B] leading-snug group-hover:text-primary transition-colors">{c.name}</div>
                      <span className="text-[9px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ouvrir →</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="text-[9px] text-neutral-400 font-extrabold truncate uppercase">{c.course}</span>
                      <CandidateAdmissionBadge type={c.type} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        c.details?.cniStatus === 'valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        c.details?.cniStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        🪪 {c.details?.cniStatus === 'valid' ? 'CNI Conforme' : c.details?.cniStatus === 'rejected' ? 'CNI Rejetée' : 'CNI Déposée'}
                      </span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        c.registrationFeePaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        💳 {c.registrationFeePaid ? 'Frais Réglés' : 'Frais en Attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateCandidate={(updated) => {
            onUpdateCandidate(updated);
            setSelectedCandidate(updated);
          }}
        />
      )}
    </div>
  );
}
