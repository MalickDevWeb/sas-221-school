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
  onClose: () => void;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateDetailModal({ candidate, onClose, onUpdateCandidate }: Props) {
  const handleSendNotification = (type: string, message: string) => {
    const newNotif = { id: `not-${Date.now()}`, type, message, sentAt: new Date().toISOString() };
    onUpdateCandidate({ ...candidate, notifications: [newNotif, ...candidate.notifications] });
  };

  const handleSaveEquivalence = (eq: EquivalenceDetails) => {
    onUpdateCandidate({ ...candidate, equivalence: eq });
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-md z-[1000] flex items-center justify-center p-4 overflow-y-auto" id="candidate-detail-modal">
      <div className="bg-white rounded-2xl shadow-2xl p-5 border border-neutral-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 text-xs font-bold text-[#4A5568]">
        <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-[#1E293B] text-base leading-none">{candidate.name}</h3>
              <CandidateAdmissionBadge type={candidate.type} />
            </div>
            <p className="text-[10px] text-neutral-400 font-extrabold tracking-wide uppercase">{candidate.id} — {candidate.email}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <CandidateCniViewer candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
            <CandidateDetailsSection candidate={candidate} />
            <CandidateAlertsPanel candidate={candidate} />
          </div>
          <div className="space-y-3">
            <CandidatePaymentApprovalCard candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
            {['TRANSFER', 'VAE', 'L2', 'L3', 'M1', 'M2', 'DOC'].includes(candidate.type) && (
              <EquivalencePanel initialEquivalence={candidate.equivalence} onSave={handleSaveEquivalence} />
            )}
            <NotificationPanel notifications={candidate.notifications} onSendNotification={handleSendNotification} />
            <CandidateWorkflowPanel candidate={candidate} onUpdateCandidate={onUpdateCandidate} />
          </div>
        </div>
      </div>
    </div>
  );
}
