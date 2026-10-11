import React from 'react';

interface StepProgressIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = ['Identité', 'Palette', 'Administrateur'];

/**
 * Indicateur de progression des étapes (SRP).
 */
export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const active = currentStep === stepNum;
        const done = currentStep > stepNum;
        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/40'
                  : done
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  active || done ? 'bg-white/20' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {done ? '✓' : stepNum}
              </span>
              {label}
            </button>
            {i < 2 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                  done ? 'bg-emerald-400/50' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

