import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roleName: string) => void;
}

export const RbacAddRoleModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [roleInput, setRoleInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleInput.trim()) return;
    onCreate(roleInput.trim());
    setRoleInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">
              person_add
            </span>
            <h4 className="font-black text-sm text-[#1E293B]">Créer un Profil / Rôle</h4>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 border-0 bg-transparent cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">
            Intitulé du Rôle
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="ex: Surveillant Général..."
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-bold cursor-pointer border-0 bg-transparent"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-black shadow hover:bg-[#921316] cursor-pointer border-0"
          >
            Ajouter le Rôle
          </button>
        </div>
      </form>
    </div>
  );
};

