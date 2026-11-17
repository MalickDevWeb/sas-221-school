import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { CandidateAdmissionBadge } from './CandidateAdmissionBadge';
import { CandidateDetailPage } from './CandidateDetailPage';

interface Props {
  candidates: ExtendedCandidate[];
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function ValidationKanbanTab({ candidates, onUpdateCandidate }: Props) {
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  if (selectedCandidate) {
    return (
      <CandidateDetailPage
        candidate={selectedCandidate}
        onBack={() => setSelectedCandidate(null)}
        onUpdateCandidate={(updated) => {
          onUpdateCandidate(updated);
          setSelectedCandidate(updated);
        }}
      />
    );
  }

  /*
   * 16/11 : libellés justes et en français simple (avant : « Admis d'office », qui veut dire « admis sans examen »,
   * pour la colonne des candidats admis) ; écran vide expliqué (avant : quatre colonnes vides de 420 px, sans un mot).
   */
  const columns: { id: ExtendedCandidate['step']; label: string; icon: string; bg: string; border: string; text: string }[] = [
    { id: 'new', label: 'Nouveaux dossiers', icon: 'solar:inbox-line-bold-duotone', bg: 'bg-neutral-50/60', border: 'border-neutral-200', text: 'text-neutral-600' },
    { id: 'docs', label: 'Pièces vérifiées', icon: 'solar:file-check-bold-duotone', bg: 'bg-amber-50/40', border: 'border-amber-200/70', text: 'text-amber-700' },
    { id: 'admitted', label: 'Admis', icon: 'solar:diploma-verified-bold-duotone', bg: 'bg-emerald-50/40', border: 'border-emerald-200/70', text: 'text-emerald-700' },
    { id: 'rejected', label: 'Refusés', icon: 'solar:close-circle-bold-duotone', bg: 'bg-rose-50/40', border: 'border-rose-200/70', text: 'text-rose-700' },
  ];
  const TYPES: { id: string; label: string }[] = [
    { id: 'BAC', label: 'Nouveau bachelier (L1)' }, { id: 'TRANSFER', label: 'Transfert universitaire' },
    { id: 'REINSCRIPTION', label: 'Réinscription' }, { id: 'INT', label: 'Étudiant international' },
    { id: 'VAE', label: 'Validation des acquis (VAE)' }, { id: 'EXCEPT', label: 'Admission exceptionnelle' },
  ];
  const nombre = (type: string) => candidates.filter(c => c.type === type).length;

  const filteredCandidates = filterType === 'ALL'
    ? candidates
    : candidates.filter(c => c.type === filterType);

  return (
    <div className="space-y-5" id="validation-kanban-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <h3 className="font-extrabold text-base text-[#1E293B]">Candidatures et validation des dossiers</h3>
          <p className="text-xs text-neutral-500 font-semibold mt-0.5">
            Cliquez sur un candidat pour ouvrir sa page complète, vérifier sa CNI, confirmer son paiement ou prononcer son admission.
          </p>
        </div>
        {candidates.length > 0 && (
          <label className="flex items-center gap-2 text-xs font-bold shrink-0">
            <Icon icon="solar:filter-bold-duotone" className="text-base text-neutral-400" />
            <span className="text-neutral-600">Type</span>
            <select
              id="candidatures-filtre-type"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-white border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs text-neutral-800 cursor-pointer font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="ALL">Tous les types ({candidates.length})</option>
              {TYPES.map(t => <option key={t.id} value={t.id} disabled={nombre(t.id) === 0}>{t.label} ({nombre(t.id)})</option>)}
            </select>
          </label>
        )}
      </div>

      {candidates.length === 0 ? (
        <div id="candidatures-vide" className="rounded-2xl border border-dashed border-neutral-300 bg-[#FAF8F6] px-6 py-12 flex flex-col items-center text-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white border border-neutral-200 text-primary flex items-center justify-center shadow-xs">
            <Icon icon="solar:inbox-line-bold-duotone" className="text-3xl" />
          </div>
          <div className="space-y-1 max-w-lg">
            <p className="text-sm font-black text-neutral-800">Aucune candidature pour le moment</p>
            <p className="text-xs text-neutral-500 font-semibold">
              Les dossiers déposés sur le portail candidat de l'école arrivent ici. Pour en recevoir, ouvrez une campagne dans
              « Configuration Sessions ».
            </p>
          </div>
          <ol className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Étapes du traitement d'un dossier">
            {columns.map((col, i) => (
              <li key={col.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${col.border} ${col.bg} text-[11px] font-bold ${col.text}`}>
                <span className="h-4 w-4 rounded-full bg-white border border-current text-[9px] font-black flex items-center justify-center">{i + 1}</span>
                {col.label}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map(col => {
            const list = filteredCandidates.filter(c => c.step === col.id);
            return (
              <section key={col.id} aria-label={col.label} className={`${col.bg} border ${col.border} rounded-2xl p-3.5 flex flex-col gap-3`}>
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Icon icon={col.icon} className={`text-base ${col.text}`} />
                    <span className={`text-xs font-black ${col.text}`}>{col.label}</span>
                  </div>
                  <span className="min-w-6 h-6 px-2 rounded-full bg-white border border-neutral-200 text-[11px] font-black text-neutral-600 flex items-center justify-center">{list.length}</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[480px] no-scrollbar">
                  {list.length === 0 && (
                    <p className="py-6 text-center text-[11px] font-semibold text-neutral-400 border border-dashed border-neutral-200 rounded-xl bg-white/60">
                      Aucun dossier
                    </p>
                  )}
                  {list.map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="w-full text-left bg-white border border-neutral-200 hover:border-primary p-3 rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-extrabold text-xs text-[#1E293B] leading-snug group-hover:text-primary transition-colors">
                          {c.name}
                          {(c.messagesNonLus ?? 0) > 0 && (
                            <span className="ml-1.5 align-middle inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-black"
                              title="Messages du candidat non lus">
                              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[11px]">mail</span>{c.messagesNonLus}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          <span>Voir</span>
                          <Icon icon="solar:arrow-right-linear" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[9px] text-neutral-400 font-extrabold truncate uppercase">{c.course}</span>
                        <CandidateAdmissionBadge type={c.type} />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          c.details?.cniStatus === 'valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          c.details?.cniStatus === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}>
                          <Icon icon={c.details?.cniStatus === 'valid' ? 'solar:verified-check-bold' : 'solar:user-id-bold-duotone'} />
                          <span>{c.details?.cniStatus === 'valid' ? 'CNI conforme' : c.details?.cniStatus === 'rejected' ? 'CNI refusée' : 'CNI déposée'}</span>
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                          c.registrationFeePaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Icon icon={c.registrationFeePaid ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'} />
                          <span>{c.registrationFeePaid ? 'Frais réglés' : 'Frais en attente'}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
