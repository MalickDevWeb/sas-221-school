import React from 'react';
import { AccessTerminal } from '../../../domain/SecurityModels';

interface TerminalCardProps {
  terminal: AccessTerminal;
  onToggle: () => void;
  onRevoke: () => void;
}

export function TerminalCard({ terminal, onToggle, onRevoke }: TerminalCardProps) {
  const isRevoked = terminal.status === 'Révoqué';
  const isActive = terminal.status === 'Actif';

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <span className="font-black text-xs text-[#1E293B]">{terminal.name}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
            isActive ? 'bg-emerald-50 text-emerald-700' :
            isRevoked ? 'bg-neutral-100 text-neutral-400' : 'bg-amber-50 text-amber-700'
          }`}>{terminal.status}</span>
        </div>
        <div className="text-[10px] text-neutral-400 font-semibold mt-1">📍 Localisation : {terminal.location}</div>
        <div className="text-[9px] text-neutral-400 font-bold uppercase font-mono mt-0.5">ID : {terminal.id}</div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-neutral-50">
        {!isRevoked ? (
          <>
            <button
              onClick={onToggle}
              className="px-2.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-[#1E293B] text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
            >
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
            <button
              onClick={onRevoke}
              className="px-2.5 py-1.5 bg-[#FFF5F5] border border-red-200 text-[#B3181C] hover:bg-red-50 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
            >
              Révoquer
            </button>
          </>
        ) : (
          <span className="text-[10px] text-neutral-400 font-black uppercase py-1">⚠️ Accès Révoqué</span>
        )}
      </div>
    </div>
  );
}
