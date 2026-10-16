import React from 'react';

interface Props {
  child: { prenom: string; nom: string; classe: string; filiere: string; matricule: string };
  onOpenAttestation: () => void;
  onOpenRetrait: () => void;
}

export function ParentChildBanner({ child, onOpenAttestation, onOpenRetrait }: Props) {
  return (
    <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-3xl p-6 mb-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shrink-0 border border-white/30 border-solid">
            {child.prenom[0]}{child.nom[0]}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Élève suivi</p>
            <h2 className="text-xl font-black leading-tight">{child.prenom} {child.nom}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.classe}</span>
              <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.filiere}</span>
              <span className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{child.matricule}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={onOpenRetrait}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-white text-primary rounded-xl text-xs font-black shadow-md hover:bg-neutral-50 transition-all flex"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            Retrait Élève
          </button>
          <button
            onClick={onOpenAttestation}
            className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 bg-blue-800/40 hover:bg-blue-800/60 text-white rounded-xl text-xs font-black border border-white/10 transition-all flex"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">file_download</span>
            Attestation
          </button>
        </div>
      </div>
    </div>
  );
}

