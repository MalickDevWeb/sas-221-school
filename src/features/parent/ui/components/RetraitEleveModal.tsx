import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  child: { prenom: string; nom: string; classe: string; matricule: string };
}

export function RetraitEleveModal({ isOpen, onClose, child }: Props) {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const qrData = encodeURIComponent(`RETRAIT|${child.matricule}|${child.prenom}_${child.nom}|${Date.now()}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-indigo-600">badge</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Pass Retrait Sécurisé</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50">
            <span translate="no" className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 text-center space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">{child.prenom} {child.nom}</h3>
            <p className="text-xs text-slate-500 font-bold">{child.classe} · {child.matricule}</p>
          </div>

          <div className="mx-auto w-48 h-48 bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-indigo-200 flex items-center justify-center shadow-inner">
            <img src={qrUrl} alt="QR Code Retrait" className="w-full h-full object-contain rounded-xl" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Autorisation Active
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Présentez ce QR Code au vigile ou à la loge de sécurité lors du départ de l'élève le <strong>{today}</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all">
            Fermer le pass
          </button>
        </div>
      </div>
    </div>
  );
}

