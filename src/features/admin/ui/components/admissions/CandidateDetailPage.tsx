import React from 'react';
import { ExtendedCandidate, EquivalenceDetails } from '../../../domain/AdmissionsExtendedModels';
import { CandidateAdmissionBadge } from './CandidateAdmissionBadge';
import { EquivalencePanel } from './EquivalencePanel';
import { CandidateAlertsPanel } from './CandidateAlertsPanel';
import { NotificationPanel } from './NotificationPanel';
import { CandidateDetailsSection } from './CandidateDetailsSection';
import { CandidateWorkflowPanel } from './CandidateWorkflowPanel';
import { CandidateCniViewer } from './CandidateCniViewer';
import { CandidatePaymentApprovalCard } from './CandidatePaymentApprovalCard';

interface Props {
  candidate: ExtendedCandidate;
  onBack: () => void;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateDetailPage({ candidate, onBack, onUpdateCandidate }: Props) {
  const handleSendNotification = (type: string, message: string) => {
    const newNotif = { id: `not-${Date.now()}`, type, message, sentAt: new Date().toISOString() };
    onUpdateCandidate({ ...candidate, notifications: [newNotif, ...candidate.notifications] });
  };

  const handleSaveEquivalence = (eq: EquivalenceDetails) => {
    onUpdateCandidate({ ...candidate, equivalence: eq });
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="candidate-detail-page">
      {/* ── TOP NAV BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black transition-all cursor-pointer shadow-2xs hover:-translate-x-0.5"
          >
            <span translate="no" className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            <span>Retour aux candidatures</span>
          </button>
          <div className="h-4 w-px bg-neutral-300 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">{candidate.name}</h2>
              <CandidateAdmissionBadge type={candidate.type} />
            </div>
            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
              Dossier #{candidate.id} • {candidate.email} • {candidate.course}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
            candidate.step === 'admitted' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
            candidate.step === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-300' :
            candidate.step === 'docs' ? 'bg-amber-50 text-amber-700 border-amber-300' :
            'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            Étape : {candidate.step === 'admitted' ? 'Admis d\'office' : candidate.step === 'rejected' ? 'Dossier Rejeté' : candidate.step === 'docs' ? 'Pièces Vérifiées' : 'Nouveau Dossier'}
          </span>
        </div>
      </div>

      {/* ── MAIN FULL-PAGE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: CNI & Academic Dossier */}
        <div className="space-y-5">
          <CandidateCniViewer candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
          <CandidateDetailsSection candidate={candidate} />
          <CandidateAlertsPanel candidate={candidate} />
        </div>

        {/* Right Column: Payment & Workflow Decisions */}
        <div className="space-y-5">
          <CandidatePaymentApprovalCard candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
          <CandidateWorkflowPanel candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
          {['TRANSFER', 'VAE', 'L2', 'L3', 'M1', 'M2', 'DOC'].includes(candidate.type) && (
            <EquivalencePanel initialEquivalence={candidate.equivalence} onSave={handleSaveEquivalence} />
          )}
          <NotificationPanel notifications={candidate.notifications} onSendNotification={handleSendNotification} />
        </div>
      </div>
    </div>
  );
}
