import React from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

const STEPS: { id: ExtendedCandidate['step']; label: string }[] = [
  { id: 'new', label: 'Nouveau' },
  { id: 'docs', label: 'Pièces Vérifiées' },
  { id: 'admitted', label: "Admis d'office" },
  { id: 'rejected', label: 'Rejeté' },
];

interface Props {
  candidate: ExtendedCandidate;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateWorkflowPanel({ candidate, onUpdateCandidate }: Props) {
  return (
    <div className="bg-neutral-50 border border-neutral-100 p-3 rounded-xl space-y-1.5">
      <span className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Avancement du Dossier Académique (Workflow)</span>
      <div className="flex flex-wrap gap-1.5">
        {STEPS.map(step => (
          <button
            key={step.id}
            onClick={() => onUpdateCandidate({ ...candidate, step: step.id })}
            className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-black border transition-all cursor-pointer ${
              candidate.step === step.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}
