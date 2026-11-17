import React from 'react';
import { createPortal } from 'react-dom';

interface Props {
  showLegalModal: 'conditions' | 'privacy' | 'mentions' | null;
  setShowLegalModal: (v: 'conditions' | 'privacy' | 'mentions' | null) => void;
}

export function LegalModal({ showLegalModal, setShowLegalModal }: Props) {
  if (!showLegalModal) return null;
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[260] flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={() => setShowLegalModal(null)}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-sm border border-neutral-gray-200/50 shadow-2xl overflow-hidden flex flex-col max-h-[min(85vh,38rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#291715] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#E3A857] text-base">gavel</span><h4 className="font-extrabold text-xs">{showLegalModal === 'conditions' ? "Conditions d'Utilisation" : showLegalModal === 'privacy' ? "Politique de Confidentialité" : "Mentions Légales"}</h4></div>
          <button onClick={() => setShowLegalModal(null)} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"><span translate="no" className="material-symbols-outlined text-xs">close</span></button>
        </div>
        <div className="flex-grow p-5 font-medium text-[10.5px] text-[#291715] space-y-3.5 leading-relaxed">
          {/* Charte §3.10 : ne rien inventer */}
          {showLegalModal === 'conditions' && <p>Conditions d'utilisation : à compléter par l'éditeur de la plateforme.</p>}
          {showLegalModal === 'privacy' && <p>Politique de confidentialité : à compléter par l'éditeur de la plateforme.</p>}
          {showLegalModal === 'mentions' && <p>Mentions légales : à compléter par l'éditeur de la plateforme.</p>}
        </div>
        <div className="p-4 bg-neutral-gray-50 border-t border-neutral-gray-150 shrink-0 text-right">
          <button onClick={() => setShowLegalModal(null)} className="w-full py-2.5 bg-[#291715] hover:bg-[#402421] text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Fermer</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
