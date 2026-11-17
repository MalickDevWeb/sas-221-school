import React from 'react';
import { PlanningSlot } from '../../../domain/SchoolModels';

interface Props {
  conflict: {
    type: 'teacher' | 'room';
    name: string;
    day: string;
    slot: string;
    conflictingSlot: PlanningSlot;
    conflictingClassName: string;
  };
  onClose: () => void;
  onForce: () => void;
}

export function ConflictModal({ conflict, onClose, onForce }: Props) {
  return (
    <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4" id="conflict-modal-root">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-red-200 w-full max-w-md space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
            <span translate="no" className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h3 className="font-extrabold text-[#1E293B] text-sm">Détection de Conflit de Planning</h3>
            <p className="text-[10px] text-neutral-400 font-semibold">Une double réservation a été détectée.</p>
          </div>
        </div>

        <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 text-xs text-neutral-700 space-y-2.5">
          <p className="font-bold text-red-900">
            {conflict.type === 'room' ? 'La salle' : "L'enseignant"} <span className="font-black underline">{conflict.name}</span> est déjà occupé(e) :
          </p>
          <div className="space-y-1 text-[11px] text-neutral-600 font-semibold pl-2 border-l-2 border-red-300">
            <div>• <span className="font-bold">Classe :</span> {conflict.conflictingClassName}</div>
            <div>• <span className="font-bold">Matière :</span> {conflict.conflictingSlot.subject}</div>
            <div>• <span className="font-bold">Horaire :</span> {conflict.day} à {conflict.slot}</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-neutral-400 block">Actions de Résolution</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Fonctionnalité non disponible : aucune source de données"
              className="px-3 py-2.5 bg-neutral-100 text-neutral-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-neutral-200"
            >
              <span translate="no" className="material-symbols-outlined text-xs">phone</span>
              <span>Contacter le Prof</span>
            </button>
            <button
              type="button"
              onClick={onForce}
              className="px-3 py-2.5 bg-primary hover:bg-[#921316] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <span translate="no" className="material-symbols-outlined text-xs">done_all</span>
              <span>Forcer l'affectation</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 font-semibold">
          « Contacter le Prof » : fonctionnalité non disponible (aucun service d'appel ou de messagerie relié).
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-50 cursor-pointer"
          >
            Fermer / Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
