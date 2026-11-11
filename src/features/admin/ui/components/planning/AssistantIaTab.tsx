import React from 'react';

interface Props {
  onApplyIaSchedule: (newSlots: any[], info: string) => void;
}

/**
 * Assistant IA d'optimisation des horaires.
 * Aucun moteur de génération de planning n'existe côté serveur : plutôt que de proposer un emploi
 * du temps inventé, l'onglet indique honnêtement que la fonctionnalité est indisponible.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AssistantIaTab(_props: Props) {
  return (
    <div className="space-y-4 text-xs font-bold text-[#4A5568]" id="assistant-ia-tab">
      <div className="pb-2 border-b border-neutral-100">
        <h3 className="font-extrabold text-[#1E293B] text-sm flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-primary">psychology</span>
          <span>Assistant IA & Optimisation des Horaires</span>
        </h3>
        <p className="text-[10px] text-neutral-400 font-semibold">Génération automatisée sous contraintes pédagogiques et logistiques.</p>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center space-y-2">
        <span translate="no" className="material-symbols-outlined text-3xl text-neutral-300">block</span>
        <p className="text-xs font-black text-neutral-600">Fonctionnalité non disponible : aucune source de données</p>
        <p className="text-[11px] font-semibold text-neutral-400">
          Aucun moteur d'optimisation n'est branché au serveur. Les créneaux se planifient manuellement depuis l'onglet de planification.
        </p>
        <button type="button" disabled aria-disabled="true" className="mt-2 px-4 py-2 bg-neutral-300 text-white rounded-xl text-[10px] font-black uppercase cursor-not-allowed">
          Générer un planning
        </button>
      </div>
    </div>
  );
}
