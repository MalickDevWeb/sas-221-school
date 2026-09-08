import React from 'react';
import { useCandidatureSettings } from '@/features/auth/hooks/useCandidatureSettings';

interface SessionGlobalControlsProps {
  generalOpen: boolean;
  setGeneralOpen: (v: boolean) => void;
  generalDeadline: string;
  setGeneralDeadline: (v: string) => void;
  generalFees: number;
  setGeneralFees: (v: number) => void;
  onApply: () => void;
}

export function SessionGlobalControls({
  generalOpen,
  setGeneralOpen,
  generalDeadline,
  setGeneralDeadline,
  generalFees,
  setGeneralFees,
  onApply
}: SessionGlobalControlsProps) {
  const { settings, updateSettings } = useCandidatureSettings();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase text-neutral-400 block tracking-wider font-mono">Bouton de Dépôt Public</span>
          <p className="text-[10px] text-neutral-400 font-medium">Bouton "S'inscrire / Déposer un Dossier" sur la page de connexion.</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider ${settings.showRegisterButton !== false ? 'text-emerald-600' : 'text-neutral-500'}`}>
            {settings.showRegisterButton !== false ? 'Affiché ●' : 'Masqué ○'}
          </span>
          <button
            onClick={() => {
              const nextVal = settings.showRegisterButton === false;
              updateSettings({ showRegisterButton: nextVal });
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border ${
              settings.showRegisterButton !== false
                ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {settings.showRegisterButton !== false ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
        <div>
          <span className="text-[9px] font-black uppercase text-neutral-400 block tracking-wider font-mono">État Général des Dépôts</span>
          <p className="text-[10px] text-neutral-400 font-medium">Activer ou suspendre le dépôt global des documents.</p>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider ${generalOpen ? 'text-emerald-600' : 'text-neutral-500'}`}>
            {generalOpen ? 'Session Ouverte ●' : 'Session Fermée ○'}
          </span>
          <button
            onClick={() => setGeneralOpen(!generalOpen)}
            className={`w-14 h-7 rounded-full p-0.5 cursor-pointer transition-all ${generalOpen ? 'bg-emerald-500' : 'bg-neutral-300'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white transition-all transform ${generalOpen ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="bg-[#FAF8F6] border border-neutral-200 rounded-xl p-4 space-y-3">
        <span className="text-[9px] font-black uppercase text-[#1E293B] block font-mono">Date & Frais de Dossier</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[8px] text-neutral-400 font-black uppercase">Date Limite</label>
            <input type="date" value={generalDeadline} onChange={e => setGeneralDeadline(e.target.value)} className="w-full px-2 py-1 text-[10px] border border-neutral-200 bg-white rounded-lg focus:outline-none" />
          </div>
          <div>
            <label className="text-[8px] text-neutral-400 font-black uppercase">Frais (FCFA)</label>
            <input type="number" value={generalFees} onChange={e => setGeneralFees(Number(e.target.value))} className="w-full px-2 py-1 text-[10px] border border-neutral-200 bg-white rounded-lg focus:outline-none" />
          </div>
        </div>
        <button onClick={onApply} className="w-full py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-[9px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer">
          Appliquer Globalement
        </button>
      </div>
    </div>
  );
}
