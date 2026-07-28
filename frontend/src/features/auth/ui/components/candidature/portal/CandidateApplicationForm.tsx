import React from 'react';
import { Campaign } from './admissionsDb';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';
import { useCandidateApplicationState } from './useCandidateApplicationState';
import {
  Step1Personal,
  Step2Academic,
  Step3Docs,
  Step4Fees,
  Step5Credentials
} from './CandidateApplicationSteps';

interface Props {
  campaign: Campaign;
  onSuccess: (candidate: ExtendedCandidate) => void;
  onCancel: () => void;
}

export function CandidateApplicationForm({ campaign, onSuccess, onCancel }: Props) {
  const state = useCandidateApplicationState(campaign, onSuccess);
  const {
    step, setStep, personal, setPersonal,
    academic, setAcademic, docs, setDocs,
    feePaid, setFeePaid, credentials, setCredentials,
    error, calculateDocProgress, handleFinalSubmit
  } = state;

  return (
    <div className="space-y-4 text-xs font-bold text-neutral-600 animate-fade-in" id="application-wizard-root">
      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
        <div>
          <h4 className="font-extrabold text-[#1E293B] text-xs uppercase">Dépôt progressive : {campaign.code}</h4>
          <span className="text-[10px] text-neutral-400">Étape {step} sur 5</span>
        </div>
        <button onClick={onCancel} className="text-neutral-400 hover:text-rose-600 uppercase font-extrabold text-[9px] cursor-pointer">Annuler</button>
      </div>

      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
        <div className="bg-[#B3181C] h-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      {error && <div className="p-2.5 text-[10px] text-[#B3181C] bg-rose-50 border border-rose-100 rounded-xl font-semibold leading-relaxed">{error}</div>}

      {step === 1 && <Step1Personal personal={personal} setPersonal={setPersonal} setStep={setStep} />}
      {step === 2 && <Step2Academic academic={academic} setAcademic={setAcademic} setStep={setStep} />}
      {step === 3 && <Step3Docs docs={docs} setDocs={setDocs} setStep={setStep} calculateDocProgress={calculateDocProgress} />}
      {step === 4 && <Step4Fees feePaid={feePaid} setFeePaid={setFeePaid} setStep={setStep} campaignFees={campaign.fees} />}
      {step === 5 && <Step5Credentials credentials={credentials} setCredentials={setCredentials} setStep={setStep} handleFinalSubmit={handleFinalSubmit} />}
    </div>
  );
}
