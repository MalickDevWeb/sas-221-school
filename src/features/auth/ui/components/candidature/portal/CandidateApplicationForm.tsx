import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Campaign } from './admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';
import { useCandidateApplicationState } from './useCandidateApplicationState';
import { StepIdentity } from './steps/StepIdentity';
import { StepGuardian } from './steps/StepGuardian';
import { StepAcademic } from './steps/StepAcademic';
import { StepDocuments } from './steps/StepDocuments';
import { StepPayment } from './steps/StepPayment';
import { StepAccount } from './steps/StepAccount';
import { StepSuccessReceipt } from './steps/StepSuccessReceipt';

interface Props {
  campaign: Campaign;
  onSuccess: (candidate: ExtendedCandidate) => void;
  onCancel: () => void;
}

export function CandidateApplicationForm({ campaign, onSuccess, onCancel }: Props) {
  const [createdCandidate, setCreatedCandidate] = useState<ExtendedCandidate | null>(null);

  const state = useCandidateApplicationState(campaign, (candidate) => {
    setCreatedCandidate(candidate);
  });

  const {
    step, setStep, personal, setPersonal, guardian, setGuardian,
    academic, setAcademic, docs, uploadDoc, uploadingDoc, simulateDocUpload, removeDoc,
    payment, simulatePayment, credentials, setCredentials,
    error, isSubmitting, handleFinalSubmit
  } = state;

  const stepLabels = ['Identité', 'Garant', 'Cursus', 'Documents', 'Frais', 'Compte'];

  if (createdCandidate) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-xs max-w-2xl mx-auto animate-fade-in">
        <StepSuccessReceipt candidate={createdCandidate} onGoToDashboard={() => onSuccess(createdCandidate)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" id="candidature-form-wizard">
      {/* Top Breadcrumb & Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg transition-all cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-base">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">{campaign.code} · Inscription 2026</span>
            <h2 className="text-sm font-black text-neutral-900 leading-tight">{campaign.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:self-auto self-end">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Étape {step} / 6</span>
          <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${(step / 6) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <img src={campaign.imageUrl} alt={campaign.title} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-black text-neutral-900 leading-snug">{campaign.title}</h4>
                <span className="text-[10px] text-neutral-500 font-medium">Session {campaign.intake || 'Octobre 2026'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-2">
              {stepLabels.map((label, idx) => {
                const sNum = idx + 1;
                const isDone = step > sNum;
                const isCurr = step === sNum;
                return (
                  <div key={label} className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${isCurr ? 'bg-primary/10 text-primary font-black' : isDone ? 'text-emerald-700 font-bold' : 'text-neutral-400 font-medium'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${isCurr ? 'bg-primary text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                      {isDone ? '✓' : sNum}
                    </div>
                    <span className="text-xs">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-900 text-[11px] font-medium">
            <span translate="no" className="material-symbols-outlined text-amber-700 text-lg">support_agent</span>
            <div>Assistance inscriptions : <strong>+221 33 800 00 00</strong></div>
          </div>
        </div>

        {/* Right Dynamic Form Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
          <AnimatePresence mode="wait">
            {step === 1 && <StepIdentity key="step1" personal={personal} setPersonal={setPersonal} onNext={() => setStep(2)} />}
            {step === 2 && <StepGuardian key="step2" guardian={guardian} setGuardian={setGuardian} onNext={() => setStep(3)} onPrev={() => setStep(1)} />}
            {step === 3 && <StepAcademic key="step3" academic={academic} setAcademic={setAcademic} onNext={() => setStep(4)} onPrev={() => setStep(2)} />}
            {step === 4 && <StepDocuments key="step4" docs={docs} uploadDoc={uploadDoc} uploadingDoc={uploadingDoc} simulateDocUpload={simulateDocUpload} removeDoc={removeDoc} onNext={() => setStep(5)} onPrev={() => setStep(3)} />}
            {step === 5 && <StepPayment key="step5" payment={payment} simulatePayment={simulatePayment} onNext={() => setStep(6)} onPrev={() => setStep(4)} />}
            {step === 6 && <StepAccount key="step6" credentials={credentials} setCredentials={setCredentials} onSubmit={handleFinalSubmit} onPrev={() => setStep(5)} isSubmitting={isSubmitting} error={error} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
