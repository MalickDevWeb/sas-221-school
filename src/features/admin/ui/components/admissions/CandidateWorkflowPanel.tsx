import React from 'react';
import { Icon } from '@iconify/react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

const STEPS: { id: ExtendedCandidate['step']; label: string; icon: string }[] = [
  { id: 'new', label: 'Nouveau', icon: 'solar:inbox-line-bold-duotone' },
  { id: 'docs', label: 'Pièces Vérifiées', icon: 'solar:file-check-bold-duotone' },
  { id: 'admitted', label: "Admis d'office", icon: 'solar:diploma-verified-bold-duotone' },
  { id: 'rejected', label: 'Rejeté', icon: 'solar:close-circle-bold-duotone' },
];

interface Props {
  candidate: ExtendedCandidate;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateWorkflowPanel({ candidate, onUpdateCandidate }: Props) {
  return (
    <div className="bg-white border border-neutral-200/90 p-4 rounded-2xl shadow-2xs space-y-2.5">
      <div className="flex items-center gap-2">
        <Icon icon="solar:route-bold-duotone" className="text-primary text-lg" />
        <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">Avancement du Dossier Académique (Workflow)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEPS.map(step => (
          <button
            key={step.id}
            onClick={() => onUpdateCandidate({ ...candidate, step: step.id })}
            className={`px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              candidate.step === step.id
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
            }`}
          >
            <Icon icon={step.icon} className="text-xs" />
            <span>{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
