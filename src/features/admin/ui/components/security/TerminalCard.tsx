import React, { useState } from 'react';
import { AccessTerminal } from '../../../domain/SecurityModels';

interface TerminalCardProps {
  terminal: AccessTerminal;
  /** Promesses : le bouton reste bloqué pendant l'appel (double clic sans effet). */
  onToggle: () => Promise<void>;
  onRevoke: () => Promise<void>;
}

export function TerminalCard({ terminal, onToggle, onRevoke }: TerminalCardProps) {
  const isRevoked = terminal.status === 'Révoqué';
  const isActive = terminal.status === 'Actif';
  const [enCours, setEnCours] = useState(false);
  // Révocation définitive : confirmation par un second clic (avant : un clic suffisait, sans aucun effet réel)
  const [confirmer, setConfirmer] = useState(false);

  const agir = async (action: () => Promise<void>) => {
    if (enCours) return;
    setEnCours(true);
    try { await action(); } finally { setEnCours(false); setConfirmer(false); }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs space-y-4" data-terminal={terminal.name}>
      <div>
        <div className="flex justify-between items-start gap-2">
          <span className="font-black text-xs text-[#1E293B] break-words">{terminal.name}</span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
            isActive ? 'bg-emerald-50 text-emerald-700' :
            isRevoked ? 'bg-neutral-100 text-neutral-400' : 'bg-amber-50 text-amber-700'
          }`}>{terminal.status}</span>
        </div>
        <div className="text-[10px] text-neutral-400 font-semibold mt-1">📍 Localisation : {terminal.location || 'non précisée'}</div>
        <div className="text-[10px] text-neutral-500 font-semibold mt-0.5">👤 Vigile : {terminal.vigilName || 'aucun'}</div>
        <div className="text-[9px] text-neutral-400 font-bold uppercase font-mono mt-0.5">ID : {terminal.id}</div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-neutral-50 flex-wrap">
        {isRevoked ? (
          <span className="text-[10px] text-neutral-400 font-black uppercase py-1">⚠️ Accès révoqué — scans refusés</span>
        ) : confirmer ? (
          <>
            <span className="text-[10px] text-rose-700 font-black py-1.5">Révocation définitive ?</span>
            <button type="button" disabled={enCours} onClick={() => setConfirmer(false)}
                    className="px-2.5 py-1.5 border border-neutral-300 text-[10px] font-black uppercase rounded-lg cursor-pointer bg-white disabled:opacity-60">Annuler</button>
            <button type="button" disabled={enCours} onClick={() => void agir(onRevoke)}
                    className="px-2.5 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg cursor-pointer border-0 disabled:opacity-60">Confirmer</button>
          </>
        ) : (
          <>
            <button type="button" disabled={enCours} onClick={() => void agir(onToggle)}
                    className="px-2.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-[#1E293B] text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer bg-white disabled:opacity-60">
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
            <button type="button" disabled={enCours} onClick={() => setConfirmer(true)}
                    className="px-2.5 py-1.5 bg-primary-light border border-red-200 text-primary hover:bg-red-50 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer disabled:opacity-60">
              Révoquer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
