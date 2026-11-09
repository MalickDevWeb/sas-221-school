import React from 'react';

/**
 * États d'écran communs à l'espace parent (APP-FE-07).
 * Aucun équivalent n'existe dans src/design-system/ ni src/shared/components/ :
 * ces blocs reprennent le style déjà utilisé par ParentGradesPage (APP-FE-06).
 */

export function ParentErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="bg-red-50 border border-red-200 border-solid rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-red-600 text-[22px]">error</span>
        <p className="font-bold text-red-700 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-white border border-red-200 border-solid rounded-xl text-xs font-black text-red-700 hover:bg-red-100 transition-all"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

export function ParentEmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div role="status" className="bg-white rounded-3xl border border-neutral-100 border-solid shadow-sm py-16 px-6 flex flex-col items-center gap-2 text-center">
      <span translate="no" aria-hidden="true" className="material-symbols-outlined text-neutral-300 text-[40px]">{icon}</span>
      <p className="font-bold text-neutral-500 text-sm">{title}</p>
      {description && <p className="text-xs text-neutral-400 font-semibold max-w-md">{description}</p>}
    </div>
  );
}
