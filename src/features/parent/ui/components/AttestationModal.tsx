import React from 'react';
import { useTenantStore } from '@/core/store/tenantStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  child: { prenom: string; nom: string; classe: string; filiere: string; matricule: string };
}

export function AttestationModal({ isOpen, onClose, child }: Props) {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const schoolName = currentTenant?.name || 'École 221';
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* En-tête d'action */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-blue-600">verified</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Document Officiel</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50">
            <span translate="no" className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Corps de l'attestation */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0">
          <div className="text-center border-b border-slate-100 pb-5">
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">République du Sénégal</p>
            <h2 className="text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">{schoolName}</h2>
            <p className="text-[11px] text-slate-500 font-medium">Secrétariat Général des Études & Scolarité</p>
          </div>

          <div className="text-center py-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black tracking-wide uppercase">
              Attestation de Scolarité
            </span>
          </div>

          <div className="text-xs leading-relaxed text-slate-700 space-y-3">
            <p>
              La Direction de l'établissement <strong>{schoolName}</strong> atteste par la présente que l'élève :
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Nom & Prénom :</span><span className="font-black text-slate-900">{child.prenom} {child.nom}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Matricule :</span><span className="font-mono font-black text-blue-600">{child.matricule}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Classe / Niveau :</span><span className="font-black text-slate-800">{child.classe} ({child.filiere})</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold">Année académique :</span><span className="font-black text-slate-800">2024 - 2025</span></div>
            </div>
            <p className="text-[11px] text-slate-600">
              Est régulièrement inscrit(e) au registre de notre établissement pour l'année scolaire en cours. La présente attestation lui est délivrée pour servir et valoir ce que de droit.
            </p>
          </div>

          {/* Tampon & Signature */}
          <div className="pt-4 flex items-end justify-between border-t border-slate-100">
            <div className="text-[10px] text-slate-500 space-y-1">
              <p>Délivré le : <strong>{today}</strong></p>
              <p className="font-mono text-[9px] text-slate-400">Réf : CERT-{child.matricule}-{Date.now().toString().slice(-4)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Le Directeur Général</p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black">
                <span translate="no" className="material-symbols-outlined text-[14px]">lock</span>
                Certifié Conforme
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={() => window.print()} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20">
            <span translate="no" className="material-symbols-outlined text-[16px]">print</span>
            Télécharger / Imprimer (PDF)
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

