import React from 'react';

/**
 * Clé API des terminaux.
 * Aucun service serveur ne gère (ni ne génère) de clé API pour les portiques : on n'affiche donc
 * aucune clé inventée et l'action de régénération est désactivée.
 */
export function ApiKeyCard() {
  return (
    <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-[#1E293B] block">
          Secret de Connexion des Terminaux (Clé API)
        </span>
        <p className="text-[10px] text-neutral-400 font-semibold">
          Clé secrète utilisée par les portiques physiques pour authentifier les requêtes de scan.
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-white px-3 py-2 border border-neutral-200 rounded-xl font-mono text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Aucune clé API configurée</span>
          <span className="text-[8px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-black">
            INDISPONIBLE
          </span>
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Fonctionnalité non disponible : aucune source de données"
          className="w-full py-2 bg-neutral-300 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-1"
        >
          <span translate="no" className="material-symbols-outlined text-sm">key</span>
          <span>Régénérer la Clé API</span>
        </button>
        <p className="text-[10px] text-neutral-400 font-semibold">
          Fonctionnalité non disponible : aucune source de données (le serveur ne gère pas encore de clé API pour les terminaux).
        </p>
      </div>
    </div>
  );
}
