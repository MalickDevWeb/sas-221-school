import React, { useState } from 'react';
import type { DossierCandidat } from './suiviApi';
import { CandidateStatusTab } from './CandidateStatusTab';

interface Props {
  dossiers: DossierCandidat[];
  onLogout: () => void;
}

/**
 * Espace candidat : uniquement le(s) dossier(s) renvoyé(s) par le serveur pour CE candidat.
 * Avant : pièces, paiements, messagerie et journal étaient lus et « enregistrés » dans le navigateur
 * (base locale + /admissions/db, fermé) : de faux succès. Ces onglets sont retirés tant qu'aucune route réelle n'existe.
 */
export function CandidateDashboardShell({ dossiers, onLogout }: Props) {
  const [choisi, setChoisi] = useState(dossiers[0]?.id ?? '');
  const dossier = dossiers.find((d) => d.id === choisi) ?? dossiers[0];
  if (!dossier) return null;
  const nom = [dossier.prenom, dossier.nom].filter(Boolean).join(' ');

  return (
    <div className="space-y-4 animate-fade-in text-xs font-bold text-neutral-600" id="candidate-shell-root">
      <div className="bg-[#291715] text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <span translate="no" className="material-symbols-outlined text-base">person</span>
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight">{nom || 'Candidat'}</h3>
            <span className="text-[9.5px] text-white/70 font-semibold">{dossier.email}</span>
          </div>
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
          Se déconnecter
        </button>
      </div>

      {dossiers.length > 1 && (
        <label className="block space-y-1">
          <span className="text-[10px] font-black uppercase text-neutral-400">Dossier</span>
          <select value={dossier.id} onChange={(e) => setChoisi(e.target.value)} className="w-full h-10 bg-white border border-neutral-200 rounded-xl px-3">
            {dossiers.map((d) => <option key={d.id} value={d.id}>{d.id} — {d.formation ?? '—'}</option>)}
          </select>
        </label>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl p-4">
        <CandidateStatusTab dossier={dossier} />
      </div>
    </div>
  );
}
