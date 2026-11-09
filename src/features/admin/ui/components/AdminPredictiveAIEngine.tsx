import React from 'react';

/**
 * Assistant IA prédictif.
 * Aucun service d'analyse prédictive n'existe côté serveur : plutôt que d'afficher des réponses
 * ou des probabilités inventées, l'écran indique honnêtement que la fonctionnalité est indisponible.
 */
export function AdminPredictiveAIEngine() {
  return (
    <div className="space-y-4" id="predictive-ai-root">
      <div className="bg-gradient-to-r from-red-50/50 to-amber-50/20 border border-red-200/60 p-5 rounded-2xl shadow-sm space-y-3">
        <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
          <span translate="no" className="material-symbols-outlined text-lg">psychology</span>
          Assistant IA Prédictif & Analyse Décisionnelle
        </h4>
        <div className="flex gap-2 opacity-60">
          <input
            type="text"
            disabled
            aria-disabled="true"
            placeholder="Fonctionnalité non disponible : aucune source de données"
            className="flex-grow px-4 py-2 border border-red-200/60 rounded-xl text-xs font-semibold bg-neutral-50 cursor-not-allowed"
          />
          <button disabled className="px-5 py-2 bg-neutral-300 text-white rounded-xl text-xs font-bold cursor-not-allowed shrink-0">Interroger</button>
        </div>
        <p className="text-[11px] font-semibold text-neutral-500">
          Fonctionnalité non disponible : aucune source de données. Aucun modèle prédictif n'est branché au serveur ; aucune analyse n'est donc affichée.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-neutral-600">
        <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-black text-neutral-400">Pronostic de réussite aux examens</span>
          <div className="flex items-center justify-between">
            <span>Probabilité estimée</span>
            <span className="text-neutral-400 font-extrabold">—</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold">Indisponible</p>
        </div>

        <div className="bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-black text-neutral-400">Prévision Trésorerie (Semestre Suivant)</span>
          <div className="flex items-center justify-between">
            <span>Projection à 6 mois</span>
            <span className="text-neutral-400 font-extrabold">—</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-semibold">Indisponible</p>
        </div>
      </div>
    </div>
  );
}
