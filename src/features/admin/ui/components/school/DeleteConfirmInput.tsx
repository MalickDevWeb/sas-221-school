import React, { useState } from 'react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmInput({ onConfirm, onCancel }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple garde-fou contre l'erreur de clic ; les droits de suppression sont vérifiés par le serveur.
    const inputUpper = code.trim().toUpperCase();
    if (inputUpper === 'SUPPRIMER' || inputUpper === 'CONFIRMER') {
      onConfirm();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2.5 animate-fade-in w-full text-left">
      <div className="text-[10px] font-black text-red-800 uppercase tracking-wide flex items-center gap-1">
        <span translate="no" className="material-symbols-outlined text-xs">security</span>
        <span>Confirmation requise</span>
      </div>
      <p className="text-[9.5px] text-neutral-500 font-semibold leading-tight">
        Tapez CONFIRMER pour valider cette action définitive.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="CONFIRMER"
          className={`flex-grow px-2.5 py-1.5 border rounded-lg text-xs font-bold focus:outline-none focus:border-red-600 bg-white ${
            error ? 'border-red-500 text-red-600' : 'border-neutral-200 text-[#1E293B]'
          }`}
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary hover:bg-[#921316] text-white text-[10px] font-black uppercase rounded-lg cursor-pointer shrink-0 border-0"
        >
          Valider
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[10px] font-black uppercase rounded-lg cursor-pointer shrink-0 border-0"
        >
          Annuler
        </button>
      </div>
      {error && (
        <p className="text-[9px] text-red-600 font-black tracking-tight">
          Tapez exactement CONFIRMER pour valider (rien n'a été supprimé).
        </p>
      )}
    </form>
  );
}
