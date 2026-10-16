import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ExtendedCandidate } from '@/features/admin/domain/AdmissionsExtendedModels';

interface Props {
  candidate: ExtendedCandidate;
  onGoToDashboard: () => void;
}

export function StepSuccessReceipt({ candidate, onGoToDashboard }: Props) {
  useEffect(() => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <span translate="no" className="material-symbols-outlined text-3xl">check_circle</span>
      </div>

      <div className="space-y-1">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
          Dossier Déposé & Enregistré avec Succès
        </span>
        <h2 className="text-xl font-black text-neutral-900 tracking-tight">Félicitations, {candidate.name} !</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Votre dossier d'admission pour <strong>{candidate.course}</strong> a bien été transmis au comité pédagogique.
        </p>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-3 shadow-2xs">
        <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
          <span className="text-[10px] font-black uppercase text-neutral-400">Numéro de Dossier Officiel</span>
          <span className="font-mono font-black text-primary text-xs tracking-wider">{candidate.id}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-medium">Cursus sollicité :</span>
          <span className="font-bold text-neutral-800 text-right">{candidate.course}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-medium">Email candidat :</span>
          <span className="font-bold text-neutral-800">{candidate.email}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-medium">Frais d'évaluation :</span>
          <span className="font-bold text-emerald-600">Paiement Validé ✓</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-neutral-500 font-medium">Statut actuel :</span>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase">En Examen</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
        <button onClick={() => window.print()} className="h-11 px-5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
          <span translate="no" className="material-symbols-outlined text-sm">print</span>
          <span>Imprimer Récépissé</span>
        </button>
        <button onClick={onGoToDashboard} className="h-11 px-6 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
          <span>Accéder à mon Espace</span>
          <span translate="no" className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
}
